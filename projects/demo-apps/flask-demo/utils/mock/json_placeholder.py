import json
from urllib.request import urlopen

json_placeholder_url = "https://jsonplaceholder.typicode.com"


def get_posts():
    request_url = f"{json_placeholder_url}/posts"
    return get_json_request(request_url)


def get_users():
    request_url = f"{json_placeholder_url}/users"
    return get_json_request(request_url)


def get_json_request(request_url):
    with urlopen(request_url) as response:
        source = response.read()
    return json.loads(source)
