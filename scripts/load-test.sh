#!/usr/bin/env bash
# Boots a 26.3 server with the built datapack and fails on any load error.
# Usage: scripts/load-test.sh [workdir]   (needs Java 25 on PATH and a built .sandstone/output)
set -euo pipefail
cd "$(dirname "$0")/.."
PACK=$PWD/.sandstone/output/datapack
DIR=${1:-/tmp/yab-ci}
JAR_URL=https://piston-data.mojang.com/v1/objects/33680f5f2ac32864d6d7cf5e56a705fdb3e05f4c/server.jar
JAR_SHA1=33680f5f2ac32864d6d7cf5e56a705fdb3e05f4c

[ -f "$PACK/pack.mcmeta" ] || { echo "no built datapack, run the build first"; exit 1; }
mkdir -p "$DIR"; cd "$DIR"
if ! echo "$JAR_SHA1  server.jar" | sha1sum -c --status 2>/dev/null; then
  curl -fsSL -o server.jar "$JAR_URL"
  echo "$JAR_SHA1  server.jar" | sha1sum -c --quiet
fi
rm -rf world log.txt
mkdir -p world/datapacks
cp -r "$PACK" world/datapacks/yadv
echo eula=true > eula.txt
# A normal world, so the pack's worldgen runs too
printf '%s\n' level-seed=12345 pause-when-empty-seconds=0 > server.properties

# Commands go in through a fifo; the server's stdout goes to log.txt
rm -f in; mkfifo in
java -Xmx2G -jar server.jar nogui < in > log.txt 2>&1 &
PID=$!
exec 3> in
for _ in $(seq 300); do
  grep -q 'Done (' log.txt && break
  kill -0 $PID 2>/dev/null || break
  sleep 1
done
echo 'datapack list enabled' >&3
sleep 2
echo stop >&3
exec 3>&-
wait $PID || true

cat log.txt
echo '----'
fail=0
grep -q 'Done (' log.txt || { echo 'server did not finish starting'; fail=1; }
grep -q 'file/yadv' log.txt || { echo 'datapack not enabled'; fail=1; }
if grep -Ei '/(WARN|ERROR)\]|exception|failed|couldn.t' log.txt \
  | grep -v "Can't keep up" | grep -v 'Ambiguity between arguments'; then
  echo 'errors or warnings in the log (above)'; fail=1
fi
[ $fail = 0 ] && echo 'load test passed'
exit $fail
