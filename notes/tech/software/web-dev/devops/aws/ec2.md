# EC2

```
aws ec2 start-instances --instance-ids [instance_id]

chmod 400 [pemfile]
ssh -i [pemfile] [ec2_machine_username]@[ec2_machine_ip_address]
```

## Free Tier

- EC2: 750 hrs/month of t2.micro/t3.micro — first 12 months of the account only.
- EBS: 30 GB of General Purpose (SSD/gp2/gp3) or Magnetic storage, 2M I/Os, 1 GB snapshot storage — also first 12 months only. Established accounts are billed standard rates (~$0.088/GB-month for gp3 in most regions) for all volumes.

## References

- [EC2 Server](https://www.youtube.com/watch?v=T-Pum2TraX4)
- [Node on Ubuntu](https://www.freecodecamp.org/news/how-to-install-node-js-on-ubuntu/)
