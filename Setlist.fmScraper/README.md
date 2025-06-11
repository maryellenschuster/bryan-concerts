# BackupSetlist.fm
Easily backup your [setlist.fm](http://setlist.fm) attended gigs data with a csv/excel spreadsheet.
The output file contains the following info for every concert:
```
 'eventDate', 'artist.mbid', 'artist.name','venue.name','venue.city.name',
 'venue.city.country.code', 'venue.city.country.name'
```

## Live Web App

Backup your data on the Flask-based Web App [backup-setlist.fm](https://backup-setlistfm.herokuapp.com) on Heroku

## Requirements

- Python 2 or 3
- The following packages: __pandas__, __numpy__, __requests__ (all available on pip: ``` pip install <package> ```)

## Usage

Replace YOUR_API_KEY_HERE with the API KEY obtained from [setlist.fm](https://www.setlist.fm/settings/api/).

Launch the script with your USERNAME on setlist.fm and the preferred format (options: _csv_ or _excel_)
```
python backup_setlist_fm.py -u USERNAME [-f FORMAT]
```

