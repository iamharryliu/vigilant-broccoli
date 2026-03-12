# K6 Load Tests

```
k6 run basic-load-test.js                                       # 10 virtual users for 30 seconds
k6 run staged-load-test.js                                      # gradually increases load from 0 to 50 users
k6 run spike-test.js                                            # tests system behavior under sudden traffic spikes

k6 run -e TARGET_URL=URL basic-load-test.js                     # test with custom URL
```
