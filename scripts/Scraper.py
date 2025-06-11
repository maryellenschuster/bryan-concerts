import pandas as pd 
import requests
import numpy as np
import argparse
import time
import os
API_ENDPOINT = "https://api.setlist.fm/rest/1.0/user/{}/attended?p={}"


def backup(username, format):
    cols = ['eventDate', 'artist.mbid', 'artist.name', 'venue.name',
        'venue.city.name', 'venue.city.country.code', 'venue.city.country.name', 'sets.set']
    rename_cols = ['date', 'artist_id', 'artist', 'venue', 'city', 'country_code', 'country', 'raw_sets']
    gigs = None

    headers = {
    'x-api-key': os.environ['SETLIST_API_KEY'],
    'Accept': 'application/json'
}

    # Initial page
    gigs_query = API_ENDPOINT.format(username, 1)
    all = requests.get(gigs_query, headers=headers).json()
    total = int(all.get('total', 0))
    num_pages = int(total / 20) + 1

    if 'setlist' in all:
        df = pd.json_normalize(all['setlist'])
        gigs = df[cols].values
    else:
        print("Warning: No 'setlist' found on page 1")
        gigs = None

    # Remaining pages
    for p in range(2, num_pages + 1):
        print(f"Processing.. {min(20 * p, total)} out of {total}")
        gigs_query = API_ENDPOINT.format(username, p)
        all = requests.get(gigs_query, headers=headers).json()

        time.sleep(1.5)

        if 'setlist' in all:
            df = pd.json_normalize(all['setlist'])
            if gigs is not None:
                gigs = np.concatenate((gigs, df[cols].values), axis=0)
            else:
                gigs = df[cols].values
        else:
            print(f"Warning: No 'setlist' found on page {p}, skipping.")

    # Save
    if gigs is not None:
        gigs_df = pd.DataFrame(gigs, columns=rename_cols)
        gigs_df['songs'] = gigs_df['raw_sets'].apply(lambda x: extract_songs({'sets': {'set': x}}))
        gigs_df.drop(columns=['raw_sets'], inplace=True)
        if format == 'excel':
            gigs_df.to_excel(f'gigs_{username}.xlsx', index=False)
        elif format == 'json':
            gigs_df.to_json(f'../public/gigs_{username}.json', orient='records', indent=2)

        else:
            gigs_df.to_csv(f'gigs_{username}.csv', index=False)
        print(f"Saved {len(gigs_df)} records.")
    else:
        print("No data collected.")


def extract_songs(setlist_item):
    try:
        sets = setlist_item.get('sets', {}).get('set', [])
        songs = []
        for set_ in sets:
            for song in set_.get('song', []):
                song_name = song.get('name')
                if song_name:
                    songs.append(song_name)
        return ', '.join(songs)
    except Exception as e:
        return ''

		
if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-u', '--username', help='username on setlist.fm', required=True)
    parser.add_argument('-f', '--format', help='format of the output file (csv or excel)', required=False, default='csv')
    args = parser.parse_args()
    print(args)
    
    backup(args.username, format=args.format)
