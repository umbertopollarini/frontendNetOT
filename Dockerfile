# # Usa un'immagine di base con Node.js
# FROM node:16

# # Imposta la directory di lavoro all'interno dell'immagine
# WORKDIR /appdashboard

# # Copia il resto del codice dell'applicazione nella directory di lavoro
# COPY . .

# # Imposta la variabile di ambiente per la porta su cui sarà in ascolto il server
# ENV PORT=3000

# # Espone la porta specificata per il server
# EXPOSE 3000

# # Avvia il server per l'applicazione React
# ENTRYPOINT ["/appdashboard/procedure.sh"]

# - - - - -- - - - -- - - -- - - -
# Usa l'immagine base di Nginx
FROM nginx:alpine

# Imposta la directory di lavoro (opzionale, per chiarezza)
WORKDIR /usr/share/nginx/html

# Rimuovi i file predefiniti di Nginx
RUN rm -rf ./*

# Copia la directory build dalla tua macchina locale al container
COPY build .

# Copia il file di configurazione di Nginx
COPY default.conf /etc/nginx/conf.d/default.conf
COPY proxy_params /etc/nginx/proxy_params

# Espone la porta 3000
EXPOSE 3000

RUN echo "Building with the latest Dockerfile version 0.0.1"

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]
