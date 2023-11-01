import os
from linode_api4 import LinodeClient, Instance


class LinodeAPI:

    def reboot_server(server):
        client = LinodeClient(server["linode-token"])
        server_id = LinodeAPI.get_linode_server_id(client, server)
        my_server = client.load(Instance, server_id)
        my_server.reboot()

    def get_linode_server_id(client, server):
        linodes = client.linode.instances()
        label = server['linode-server']
        server_id = next(linode.id for linode in linodes if linode.label == label)
        return server_id
