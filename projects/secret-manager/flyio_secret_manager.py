import os, json, subprocess

CUSTOM_FLYIO_MAPPING = "custom-flyio-key-mapping.json"
DEFAULT_FLYIO_MAPPING = "default-flyio-key-mapping.json"


def set_flyio_secrets(app):
    app_name = app["name"]
    secrets = app["password_key_values"]
    print(f"FlyIO Secret Setting- Setting secrets for {app_name}.")
    for secret_name, secret_value in secrets.items():
        #     command = f"flyctl secrets unset --app {app_name} {secret_name} --stage"
        #     subprocess.run(command, shell=True,
        # stdout=subprocess.DEVNULL,
        # stderr=subprocess.STDOUT)
        command = (
            f"flyctl secrets set --app {app_name} {secret_name}={secret_value} --stage"
        )
        subprocess.run(
            command, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT
        )
    # command = f'flyctl deploy --app {app_name}'
    # subprocess.run(command, shell=True)
    # flyctl deploy --dockerfile Dockerfile --config config.toml


def main():
    print(f"FlyIO Secret Setting - Start.")
    if os.path.exists(CUSTOM_FLYIO_MAPPING):
        with open(CUSTOM_FLYIO_MAPPING, "r") as file:
            apps = json.load(file)
    else:
        with open(DEFAULT_FLYIO_MAPPING, "r") as file:
            apps = json.load(file)
    for app in apps:
        set_flyio_secrets(app)
    print(f"FlyIO Secret Setting - Finish.")


if __name__ == "__main__":
    main()
