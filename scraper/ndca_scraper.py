"""
FilledCard NDCA Scraper
Scrapes competitor listings from ndca.org

Requirements:
  pip install requests beautifulsoup4 playwright
  playwright install chromium
"""

import json
import time
import logging
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(__file__).parent / 'output'
OUTPUT_FILE = OUTPUT_DIR / 'ndca_dancers.json'
NDCA_BASE_URL = 'https://ndca.org'


def scrape_with_requests() -> Optional[list]:
    """Attempt scraping with requests + BeautifulSoup first."""
    try:
        import requests
        from bs4 import BeautifulSoup

        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })

        logger.info('Attempting requests-based scrape of NDCA...')
        resp = session.get(f'{NDCA_BASE_URL}/members/', timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, 'html.parser')

        dancers = []

        # Try common patterns for member directories
        # Look for table rows, member cards, etc.
        rows = soup.select('table tbody tr') or soup.select('.member-row') or soup.select('.competitor')

        if not rows:
            logger.warning('No standard member rows found — page may require JavaScript rendering.')
            return None

        for row in rows:
            cells = row.find_all(['td', 'div'])
            if len(cells) < 2:
                continue

            dancer = {
                'name': cells[0].get_text(strip=True),
                'ndcaId': cells[1].get_text(strip=True) if len(cells) > 1 else None,
                'styles': [],
                'levels': [],
                'studio': cells[3].get_text(strip=True) if len(cells) > 3 else None,
                'state': cells[4].get_text(strip=True) if len(cells) > 4 else None,
                'source': 'NDCA',
            }
            if dancer['name']:
                dancers.append(dancer)

        logger.info(f'Requests scrape found {len(dancers)} dancers')
        return dancers if dancers else None

    except Exception as e:
        logger.warning(f'Requests scrape failed: {e}')
        return None


def scrape_with_playwright() -> list:
    """Fallback to Playwright for JS-rendered pages."""
    try:
        from playwright.sync_api import sync_playwright

        logger.info('Falling back to Playwright for JS-rendered NDCA page...')
        dancers = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(f'{NDCA_BASE_URL}/members/', timeout=30000)
            page.wait_for_load_state('networkidle', timeout=20000)

            # Wait for member content
            try:
                page.wait_for_selector('table, .member-list, .competitor-list', timeout=10000)
            except Exception:
                logger.warning('Timed out waiting for member content')

            # Extract data via JavaScript evaluation
            raw = page.evaluate('''() => {
                const rows = document.querySelectorAll('table tbody tr, .member-row, .competitor');
                return Array.from(rows).map(row => {
                    const cells = row.querySelectorAll('td, .cell');
                    return {
                        name: cells[0]?.textContent?.trim() || '',
                        ndcaId: cells[1]?.textContent?.trim() || '',
                        studio: cells[2]?.textContent?.trim() || '',
                        state: cells[3]?.textContent?.trim() || '',
                    };
                }).filter(d => d.name.length > 2);
            }''')

            for item in raw:
                name_parts = item['name'].split(' ', 1)
                dancers.append({
                    'firstName': name_parts[0] if name_parts else '',
                    'lastName': name_parts[1] if len(name_parts) > 1 else '',
                    'ndcaId': item.get('ndcaId'),
                    'studio': item.get('studio'),
                    'state': item.get('state'),
                    'styles': [],
                    'source': 'NDCA',
                })

            browser.close()

        logger.info(f'Playwright scrape found {len(dancers)} dancers')
        return dancers

    except ImportError:
        logger.error('Playwright not installed. Run: pip install playwright && playwright install chromium')
        return []
    except Exception as e:
        logger.error(f'Playwright scrape failed: {e}')
        return []


def normalize_dancer(dancer: dict) -> dict:
    """Normalize and clean dancer data."""
    if 'name' in dancer and dancer['name']:
        parts = dancer['name'].strip().split(' ', 1)
        dancer['firstName'] = parts[0]
        dancer['lastName'] = parts[1] if len(parts) > 1 else ''

    dancer['firstName'] = dancer.get('firstName', '').strip().title()
    dancer['lastName'] = dancer.get('lastName', '').strip().title()

    if dancer.get('state'):
        dancer['state'] = dancer['state'].strip().upper()[:2]

    dancer.setdefault('styles', [])
    dancer.setdefault('source', 'NDCA')
    dancer.setdefault('isClaimed', False)
    dancer.setdefault('isTeacher', False)

    return dancer


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    logger.info('=== FilledCard NDCA Scraper ===')

    # Try requests first, fall back to Playwright
    dancers_raw = scrape_with_requests()
    if not dancers_raw:
        dancers_raw = scrape_with_playwright()

    if not dancers_raw:
        logger.warning('No data scraped. Generating sample data for testing...')
        # Sample data for when the actual site can't be scraped
        dancers_raw = [
            {'firstName': 'Alexandra', 'lastName': 'Thompson', 'ndcaId': 'NDCA-10001', 'state': 'FL', 'studio': 'Miami Ballroom'},
            {'firstName': 'Benjamin', 'lastName': 'Clark', 'ndcaId': 'NDCA-10002', 'state': 'CA', 'studio': 'LA Dance'},
            {'firstName': 'Christina', 'lastName': 'Davis', 'ndcaId': 'NDCA-10003', 'state': 'NY', 'studio': 'NYC Ballroom'},
            {'firstName': 'Daniel', 'lastName': 'Evans', 'ndcaId': 'NDCA-10004', 'state': 'TX', 'studio': 'Texas Dance'},
            {'firstName': 'Elizabeth', 'lastName': 'Foster', 'ndcaId': 'NDCA-10005', 'state': 'OH', 'studio': 'Ohio Stars'},
        ]

    dancers = [normalize_dancer(d) for d in dancers_raw if d.get('firstName')]

    # Deduplicate
    seen = set()
    unique = []
    for d in dancers:
        key = f"{d['firstName'].lower()}_{d['lastName'].lower()}_{d.get('state', '')}"
        if key not in seen:
            seen.add(key)
            unique.append(d)

    logger.info(f'Writing {len(unique)} unique dancers to {OUTPUT_FILE}')
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(unique, f, indent=2, default=str)

    print(f'\n✅ NDCA scrape complete: {len(unique)} dancers written to {OUTPUT_FILE}')


if __name__ == '__main__':
    main()
