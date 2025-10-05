docker-compose down
rm -rf Firebase/data/
cp -r Firebase/data.bak Firebase/data
docker-compose up -d