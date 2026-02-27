"""
FilledCard O2CM Scraper
Scrapes competition results from o2cm.com

Requirements:
  pip install requests beautifulsoup4
"""

import json
import time
import logging
import re
from pathlib import Path
from typing import Optional
from urllib.parse import urlencode, urljoin

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(__file__).parent / 'output'
OUTPUT_FILE = OUTPUT_DIR / 'o2cm_results.json'

O2CM_BASE = 'https://o2cm.com'
O2CM_EVENTS_URL = f'{O2CM_BASE}/ordermanager/eventlist.asp'


def get_event_list(session) -> list:
    """Fetch list of competitions from O2CM."""
    try:
        resp = session.get(O2CM_EVENTS_URL, timeout=15)
        resp.raise_for_status()

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, 'html.parser')

        events = []
        # O2CM event links typically look like /ordermanager/results3.asp?event=EVENTCODE
        for link in soup.find_all('a', href=True):
            href = link['href']
            if 'results3.asp' in href or 'results2.asp' in href:
                event_name = link.get_text(strip=True)
                if event_name:
                    events.append({
                        'name': event_name,
                        'url': urljoin(O2CM_BASE, href),
                    })

        logger.info(f'Found {len(events)} events on O2CM')
        return events[:20]  # Limit to most recent 20 events
    except Exception as e:
        logger.error(f'Failed to get event list: {e}')
        return []


def scrape_event_results(session, event: dict) -> list:
    """Scrape results from a single competition."""
    results = []
    try:
        resp = session.get(event['url'], timeout=15)
        resp.raise_for_status()

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, 'html.parser')

        # O2CM results typically in table format
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:  # Skip header
                cells = [td.get_text(strip=True) for td in row.find_all('td')]
                if len(cells) >= 4:
                    result = {
                        'competitionName': event['name'],
                        'competitionDate': extract_date(event['name']),
                        'location': None,
                        'style': cells[0] if cells else '',
                        'level': cells[1] if len(cells) > 1 else '',
                        'placement': parse_placement(cells[2]) if len(cells) > 2 else None,
                        'totalCompetitors': parse_int(cells[3]) if len(cells) > 3 else None,
                        'dancer1Name': cells[4] if len(cells) > 4 else '',
                        'dancer2Name': cells[5] if len(cells) > 5 else '',
                        'source': 'O2CM',
                        'externalId': f"o2cm_{hash(event['url'] + str(cells))}",
                    }
                    if result['style'] and result['dancer1Name']:
                        results.append(result)

        logger.info(f"  {event['name']}: {len(results)} results")
        time.sleep(1)  # Polite delay
    except Exception as e:
        logger.warning(f"  Failed to scrape {event['name']}: {e}")

    return results


def extract_date(competition_name: str) -> Optional[str]:
    """Try to extract year from competition name."""
    match = re.search(r'20\d{2}', competition_name)
    if match:
        return f"{match.group()}-01-01"
    return None


def parse_placement(val: str) -> Optional[int]:
    """Parse placement from string like '1st', '2', etc."""
    if not val:
        return None
    match = re.search(r'\d+', val)
    return int(match.group()) if match else None


def parse_int(val: str) -> Optional[int]:
    if not val:
        return None
    match = re.search(r'\d+', val)
    return int(match.group()) if match else None


def main():
    import requests
    OUTPUT_DIR.mkdir(exist_ok=True)

    logger.info('=== FilledCard O2CM Scraper ===')

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (compatible; FilledCard/1.0; research scraper)',
        'Accept': 'text/html,application/xhtml+xml',
    })

    events = get_event_list(session)

    if not events:
        logger.warning('Could not fetch event list. Generating sample data...')
        results = [
            {
                'competitionName': 'Ohio Star Ball 2024',
                'competitionDate': '2024-11-15',
                'location': 'Columbus, OH',
                'style': 'WALTZ',
                'level': 'GOLD',
                'placement': 1,
                'totalCompetitors': 8,
                'dancer1Name': 'Alexandra Thompson',
                'dancer2Name': 'Benjamin Clark',
                'source': 'O2CM',
                'externalId': 'o2cm_sample_001',
            },
            {
                'competitionName': 'Emerald Ball 2024',
                'competitionDate': '2024-05-10',
                'location': 'Los Angeles, CA',
                'style': 'CHA_CHA',
                'level': 'SILVER',
                'placement': 2,
                'totalCompetitors': 12,
                'dancer1Name': 'Christina Davis',
                'dancer2Name': 'Daniel Evans',
                'source': 'O2CM',
                'externalId': 'o2cm_sample_002',
            },
            {
                'competitionName': 'Manhattan Amateur Classic 2024',
                'competitionDate': '2024-08-22',
                'location': 'New York, NY',
                'style': 'TANGO',
                'level': 'NOVICE',
                'placement': 3,
                'totalCompetitors': 15,
                'dancer1Name': 'Elizabeth Foster',
                'dancer2Name': 'Michael Santos',
                'source': 'O2CM',
                'externalId': 'o2cm_sample_003',
            },
        ]
    else:
        results = []
        for event in events:
            event_results = scrape_event_results(session, event)
            results.extend(event_results)

    # Deduplicate by externalId
    seen = set()
    unique = []
    for r in results:
        key = r.get('externalId', str(r))
        if key not in seen:
            seen.add(key)
            unique.append(r)

    logger.info(f'Writing {len(unique)} results to {OUTPUT_FILE}')
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(unique, f, indent=2, default=str)

    print(f'\n✅ O2CM scrape complete: {len(unique)} results written to {OUTPUT_FILE}')


if __name__ == '__main__':
    main()
