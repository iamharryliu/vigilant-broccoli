import os, json, subprocess, threading, time


class FLYIO_KEY_MAPPING:
    CUSTOM_FLYIO_MAPPING = "custom-flyio-key-mapping.json"
    DEFAULT_FLYIO_MAPPING = "default-flyio-key-mapping.json"


class FlyIOSecretManager:
    @staticmethod
    def deploy_apps_using_mapping():
        if os.path.exists(FLYIO_KEY_MAPPING.CUSTOM_FLYIO_MAPPING):
            MAPPING = FLYIO_KEY_MAPPING.CUSTOM_FLYIO_MAPPING
        else:
            MAPPING = FLYIO_KEY_MAPPING.DEFAULT_FLYIO_MAPPING

        with open(MAPPING, "r") as file:
            apps = json.load(file)

        threads = []
        for app in apps:
            thread = threading.Thread(
                target=FlyIOSecretManager.set_flyio_secrets_and_deploy, args=(app,)
            )
            thread.start()
            threads.append(thread)

        for thread in threads:
            thread.join()

    @staticmethod
    def set_flyio_secrets_and_deploy(app):
        FlyIOSecretManager.set_flyio_secrets(app)
        FlyIOSecretManager.deploy_app(app)

    @staticmethod
    def set_flyio_secrets(app):
        app_name = app["name"]
        secrets = app["password_key_values"]
        print(f"FlyIO Secrets Manager - Setting secrets for {app_name}.")
        for secret_name, secret_value in secrets.items():
            command = f"flyctl secrets set --app {app_name} {secret_name}={secret_value} --stage"
            subprocess.run(
                command, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT
            )
        print(f"FlyIO Secret Manager - Finished setting secrets for {app_name}.")

    @staticmethod
    def deploy_app(app):
        if "working_directory" in app and "dockerfile" in app and "config" in app:
            app_name = app["name"]
            working_directory = app["working_directory"]
            dockerfile = app["dockerfile"]
            config = app["config"]
            print(f"FlyIO Secrets Manager - Deploying {app_name}.")
            command = f"cd {working_directory} && flyctl deploy --dockerfile {dockerfile} --config {config}"
            subprocess.run(
                command, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT
            )
            print(f"FlyIO Secrets Manager - Finished deploying {app_name}.")


def main():
    start_time = time.time()
    print(f"FlyIO Secrets Manager - Start.")
    FlyIOSecretManager.deploy_apps_using_mapping()
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"FlyIO Secrets Manager - Finished in {elapsed_time}s.")


if __name__ == "__main__":
    main()
