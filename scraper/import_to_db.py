"""
FilledCard Database Importer
Reads scraped JSON files and inserts into PostgreSQL.

Requirements:
  pip install psycopg2-binary python-dotenv

Usage:
  python import_to_db.py
  python import_to_db.py --ndca-only
  python import_to_db.py --o2cm-only
"""

import json
import logging
import argparse
import os
import sys
import re
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(__file__).parent / 'output'
NDCA_FILE = OUTPUT_DIR / 'ndca_dancers.json'
O2CM_FILE = OUTPUT_DIR / 'o2cm_results.json'

STYLE_TO_CATEGORY = {
    'WALTZ': 'STANDARD',
    'TANGO': 'STANDARD',
    'FOXTROT': 'SMOOTH',
    'VIENNESE_WALTZ': 'STANDARD',
    'QUICKSTEP': 'STANDARD',
    'CHA_CHA': 'RHYTHM',
    'SAMBA': 'LATIN',
    'RUMBA': 'RHYTHM',
    'PASO_DOBLE': 'LATIN',
    'JIVE': 'LATIN',
    'BOLERO': 'RHYTHM',
    'MAMBO': 'RHYTHM',
    'WEST_COAST_SWING': 'RHYTHM',
}

def get_db_connection():
    """Get PostgreSQL connection from DATABASE_URL env var."""
    try:
        import psycopg2
        from dotenv import load_dotenv

        # Load .env.local from project root (one level up from scraper/)
        env_file = Path(__file__).parent.parent / '.env.local'
        if env_file.exists():
            load_dotenv(env_file)
        else:
            load_dotenv()

        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            logger.error('DATABASE_URL not found in environment variables')
            sys.exit(1)

        conn = psycopg2.connect(db_url)
        logger.info('Connected to PostgreSQL')
        return conn
    except ImportError:
        logger.error('psycopg2 not installed. Run: pip install psycopg2-binary python-dotenv')
        sys.exit(1)


def normalize_style_name(raw_style: str) -> str:
    """Convert human-readable style name to enum value."""
    mapping = {
        'waltz': 'WALTZ',
        'tango': 'TANGO',
        'foxtrot': 'FOXTROT',
        'viennese waltz': 'VIENNESE_WALTZ',
        'viennese': 'VIENNESE_WALTZ',
        'quickstep': 'QUICKSTEP',
        'cha cha': 'CHA_CHA',
        'cha-cha': 'CHA_CHA',
        'samba': 'SAMBA',
        'rumba': 'RUMBA',
        'paso doble': 'PASO_DOBLE',
        'paso': 'PASO_DOBLE',
        'jive': 'JIVE',
        'bolero': 'BOLERO',
        'mambo': 'MAMBO',
        'west coast swing': 'WEST_COAST_SWING',
        'wcs': 'WEST_COAST_SWING',
    }
    return mapping.get(raw_style.lower().strip(), raw_style.upper().replace(' ', '_'))


def normalize_level(raw_level: str) -> str:
    """Convert human-readable level to enum value."""
    mapping = {
        'newcomer': 'NEWCOMER',
        'bronze': 'BRONZE',
        'silver': 'SILVER',
        'gold': 'GOLD',
        'novice': 'NOVICE',
        'pre-championship': 'PRE_CHAMP',
        'pre championship': 'PRE_CHAMP',
        'pre-champ': 'PRE_CHAMP',
        'championship': 'CHAMPIONSHIP',
        'champ': 'CHAMPIONSHIP',
    }
    return mapping.get(raw_level.lower().strip(), 'BRONZE')


def import_ndca_dancers(conn, dancers: list) -> dict:
    """Import NDCA dancer profiles."""
    cur = conn.cursor()
    inserted = 0
    skipped = 0
    errors = 0

    logger.info(f'Importing {len(dancers)} NDCA dancers...')

    for dancer in dancers:
        first_name = dancer.get('firstName', '').strip()
        last_name = dancer.get('lastName', '').strip()

        if not first_name or not last_name:
            skipped += 1
            continue

        try:
            # Check for duplicate by name + state
            cur.execute(
                'SELECT id FROM "Dancer" WHERE "firstName" = %s AND "lastName" = %s AND "state" = %s',
                (first_name, last_name, dancer.get('state'))
            )
            existing = cur.fetchone()

            if existing:
                skipped += 1
                continue

            # Insert dancer
            import uuid
            dancer_id = str(uuid.uuid4()).replace('-', '')[:25]

            email = f"{first_name.lower()}.{last_name.lower()}.{dancer_id[:6]}@noreply.filledcard.com"

            cur.execute('''
                INSERT INTO "Dancer" (
                    id, email, "firstName", "lastName", "isClaimed", "isTeacher",
                    "teacherVerified", "openToProAm", "partnerStatus",
                    state, "studioName", "ndcaId",
                    "partnershipType", "createdAt", "updatedAt"
                ) VALUES (
                    %s, %s, %s, %s, false, false,
                    false, false, 'OPEN_TO_INQUIRIES',
                    %s, %s, %s,
                    '{}', NOW(), NOW()
                )
            ''', (
                dancer_id,
                email,
                first_name,
                last_name,
                dancer.get('state'),
                dancer.get('studio'),
                dancer.get('ndcaId'),
            ))

            # Insert dance styles
            for style_info in dancer.get('styles', []):
                style = normalize_style_name(style_info.get('style', style_info) if isinstance(style_info, dict) else style_info)
                level = normalize_level(style_info.get('level', 'BRONZE') if isinstance(style_info, dict) else 'BRONZE')
                category = STYLE_TO_CATEGORY.get(style, 'STANDARD')

                style_id = str(uuid.uuid4()).replace('-', '')[:25]
                try:
                    cur.execute('''
                        INSERT INTO "DanceStyle" (id, "dancerId", style, category, level, "isCompeting", "wantsToCompete")
                        VALUES (%s, %s, %s, %s, %s, false, false)
                        ON CONFLICT ("dancerId", style) DO NOTHING
                    ''', (style_id, dancer_id, style, category, level))
                except Exception:
                    pass  # Skip invalid style

            inserted += 1

        except Exception as e:
            logger.error(f'Error inserting {first_name} {last_name}: {e}')
            errors += 1
            conn.rollback()
            continue

    conn.commit()
    cur.close()

    return {'inserted': inserted, 'skipped': skipped, 'errors': errors}


def import_o2cm_results(conn, results: list) -> dict:
    """Import O2CM competition results, linking to existing dancers where possible."""
    import uuid
    cur = conn.cursor()
    inserted = 0
    skipped = 0
    linked = 0

    logger.info(f'Importing {len(results)} O2CM competition results...')

    for result in results:
        external_id = result.get('externalId')

        # Skip if already imported
        if external_id:
            cur.execute('SELECT id FROM "CompetitionResult" WHERE "externalId" = %s AND source = \'O2CM\'', (external_id,))
            if cur.fetchone():
                skipped += 1
                continue

        dancer1_name = result.get('dancer1Name', '')
        if not dancer1_name:
            skipped += 1
            continue

        # Try to find existing dancer profile
        name_parts = dancer1_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        dancer_id = None
        if first_name and last_name:
            cur.execute(
                'SELECT id FROM "Dancer" WHERE "firstName" = %s AND "lastName" = %s LIMIT 1',
                (first_name, last_name)
            )
            row = cur.fetchone()
            if row:
                dancer_id = row[0]
                linked += 1

        # If no match, create unclaimed profile
        if not dancer_id and first_name:
            dancer_id = str(uuid.uuid4()).replace('-', '')[:25]
            email = f"{first_name.lower()}.{last_name.lower()}.{dancer_id[:6]}@noreply.filledcard.com"
            try:
                cur.execute('''
                    INSERT INTO "Dancer" (
                        id, email, "firstName", "lastName", "isClaimed", "isTeacher",
                        "teacherVerified", "openToProAm", "partnerStatus",
                        "partnershipType", "createdAt", "updatedAt"
                    ) VALUES (
                        %s, %s, %s, %s, false, false,
                        false, false, 'OPEN_TO_INQUIRIES',
                        '{}', NOW(), NOW()
                    )
                ''', (dancer_id, email, first_name, last_name))
            except Exception as e:
                logger.debug(f'Could not create dancer for {dancer1_name}: {e}')
                dancer_id = None

        if not dancer_id:
            skipped += 1
            continue

        # Parse date
        comp_date = result.get('competitionDate')
        try:
            if isinstance(comp_date, str) and comp_date:
                comp_date_obj = datetime.strptime(comp_date[:10], '%Y-%m-%d')
            else:
                comp_date_obj = datetime.now()
        except ValueError:
            comp_date_obj = datetime.now()

        result_id = str(uuid.uuid4()).replace('-', '')[:25]
        try:
            cur.execute('''
                INSERT INTO "CompetitionResult" (
                    id, "dancerId", "competitionName", "competitionDate",
                    location, "partnerName", style, level,
                    placement, "totalCompetitors", source, "externalId", "createdAt"
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'O2CM', %s, NOW()
                )
            ''', (
                result_id,
                dancer_id,
                result.get('competitionName', 'Unknown Competition'),
                comp_date_obj,
                result.get('location'),
                result.get('dancer2Name'),
                normalize_style_name(result.get('style', 'WALTZ')),
                normalize_level(result.get('level', 'BRONZE')),
                result.get('placement'),
                result.get('totalCompetitors'),
                external_id,
            ))
            inserted += 1
        except Exception as e:
            logger.error(f'Error inserting result: {e}')
            conn.rollback()
            skipped += 1
            continue

    conn.commit()
    cur.close()

    return {'inserted': inserted, 'skipped': skipped, 'linked': linked}


def main():
    parser = argparse.ArgumentParser(description='Import scraped data into FilledCard database')
    parser.add_argument('--ndca-only', action='store_true', help='Only import NDCA dancers')
    parser.add_argument('--o2cm-only', action='store_true', help='Only import O2CM results')
    args = parser.parse_args()

    conn = get_db_connection()

    total_stats = {}

    try:
        if not args.o2cm_only:
            if NDCA_FILE.exists():
                with open(NDCA_FILE) as f:
                    ndca_dancers = json.load(f)
                stats = import_ndca_dancers(conn, ndca_dancers)
                total_stats['ndca'] = stats
                logger.info(f"NDCA: {stats['inserted']} inserted, {stats['skipped']} skipped, {stats['errors']} errors")
            else:
                logger.warning(f'NDCA file not found at {NDCA_FILE}. Run ndca_scraper.py first.')

        if not args.ndca_only:
            if O2CM_FILE.exists():
                with open(O2CM_FILE) as f:
                    o2cm_results = json.load(f)
                stats = import_o2cm_results(conn, o2cm_results)
                total_stats['o2cm'] = stats
                logger.info(f"O2CM: {stats['inserted']} inserted, {stats['skipped']} skipped, {stats['linked']} linked to existing profiles")
            else:
                logger.warning(f'O2CM file not found at {O2CM_FILE}. Run o2cm_scraper.py first.')

    finally:
        conn.close()

    print('\n=== Import Summary ===')
    if 'ndca' in total_stats:
        s = total_stats['ndca']
        print(f"NDCA Dancers: {s['inserted']} inserted | {s['skipped']} skipped | {s['errors']} errors")
    if 'o2cm' in total_stats:
        s = total_stats['o2cm']
        print(f"O2CM Results: {s['inserted']} inserted | {s['skipped']} skipped | {s['linked']} linked")
    print('✅ Import complete')


if __name__ == '__main__':
    main()
