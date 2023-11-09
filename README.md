# OWASP Cornucopia Online

[Official OWASP Cornucopia Game](https://owasp.org/www-project-cornucopia/)

This is a hacked together online version of the cornucopia security game.
The game consists of playing cards that each have a rather unspecific situation of a possible security breach. The target in the game is now to place the playing cards somewhere on your software (code / tech stack / infrastruktur) and come up with a real threat to your software.

In this online version you can upload an image of your architecture and play with as many players as you want. The team decides whos turn it is. The player selects a card out of his card set and places a red square on the architecture image. In a comment he can now describe the thread he sees in the software. Other players can like this potential thread, if the feel there's a real thread in your software. Each player gets points for describing a thread and additional points for each like. The findings can then be downloaded in the end as JSON and the architecture image saved via right-click (save image) with the locations of the findings.
Afterward the findings with the most likes should be checked if they exist in your software.

Each room is secured by a password. You can end you team the link to your room.

This project was build around websockets and node. 

This project was hacked together with some older code snippets and is propably not secure in itself, it should not be hosted publically.
It was a quick experiment, the code is ugly, the UI is not pretty, feel free to optimize it.

To run it:
    git clone
    docker build --tag cornucopia .
    docker run -d -p 80:3000 cornucopia

now go to http://localhost

This application should run behind a https proxy that supports websockets.
e.g. nginx:

    upstream backend_cornucopia_ws {
        server <backend_container_ip_and_port>;
    }

    map $http_upgrade $connection_upgrade {
        default Upgrade;
        ''      close;
    }

    server {
        listen              443 ssl;
        server_name         cornucopia.local;
        ssl_certificate     cornucopia.local.crt;
        ssl_certificate_key cornucopia.local.key;

        location / {
            proxy_pass http://backend_cornucopia;
        }
        location /ws/ {
                proxy_pass http://backend_cornucopia;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "Upgrade";
                proxy_set_header Host $host;
                proxy_connect_timeout 7d;
                proxy_send_timeout 7d;
                proxy_read_timeout 7d;
            }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }