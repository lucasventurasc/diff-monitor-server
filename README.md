##Greenpiece

###Run locally with Docker

```bash
docker build . -f run/Dockerfile -t diff-monitor-server
```

```bash
docker run --volume /temp/diff-monitor:/temp/diff-monitor:rw diff-monitor-server
```

###Run locally with Compose

```bash
docker run --volume /temp/diff-monitor:/temp/diff-monitor:rw node-greenpiece
```
