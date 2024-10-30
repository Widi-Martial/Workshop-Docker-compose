# copy data from dump in container 
- docker cp dump.sql seniorlovedploiement-db-1:/dump.sql
# restaure copy 
- docker exec -it seniorlovedploiement-db-1 psql -U senior -d senior -f /dump.sql
# push container in Docker hub
- docker tag local-image:tagname new-repo:tagname
- docker push new-repo:
- docker push dockerUserName/dockerRepos:tagname