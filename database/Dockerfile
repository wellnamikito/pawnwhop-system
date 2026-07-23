FROM postgres:16

# Копируем конфиг, который лежит в этой же папке
COPY postgresql.conf /tmp/postgresql.conf

# Настраиваем скрипт для правильного применения конфига и выдачи прав
RUN echo '#!/bin/bash\n\
cp /tmp/postgresql.conf /var/lib/postgresql/data/postgresql.conf\n\
chown postgres:postgres /var/lib/postgresql/data/postgresql.conf\n\
chmod 0600 /var/lib/postgresql/data/postgresql.conf\n\
' > /docker-entrypoint-initdb.d/import-config.sh \
    && chmod +x /docker-entrypoint-initdb.d/import-config.sh