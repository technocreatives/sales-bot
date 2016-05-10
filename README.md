# Sales Bot

## Documentation

* [Slack Message Formatting](https://api.slack.com/docs/formatting/)
* [10 000ft API Documentation](http://www.10000ft.com/plans/reference/api-documentation)
* [Pipedrive NodeJS Client](https://github.com/pipedrive/client-nodejs)

## Sample

Query:

    curl localhost:3000?q=15-114

Response:

    {
      "drive": {
        "id": "0B_cCC-5a2PFVdUxZRWZjQ0ZmZWs",
        "name": "15-114 - 2015-12-09 Autoliv - Spoke Touch Switches",
        "webViewLink": "https://docs.google.com/a/technocreatives.com/folderview?id=0B_cCC-5a2PFVdUxZRWZjQ0ZmZWs&usp=drivesdk"
      },
      "ten": {
        "id": "856615",
        "name": "15-114 Spoke Touch Switches (OH)",
        "webViewLink": "https://app.10000ft.com/viewproject?id=856615",
        "status": "Confirmed",
        "client": "Autoliv",
        "description": "...",
        "starts_at": "2016-01-07",
        "ends_at": "2016-11-30"
      },
      "pipedrive": {
        "id": "604",
        "name": "15-114-4 - Autoliv - Spoke Touch Switches",
        "webViewLink": "https://technocreatives.pipedrive.com/deal/view/604",
        "status": "open",
        "client": "Stefan Andersson, Autoliv",
        "stage": "Get the Order",
        "owner": "Oskar Hagberg"
      } 
    }


