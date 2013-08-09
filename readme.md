# ucoin-web

## Installation

### Node.js

ucoin-web is powered by Node.js v0.10+, so you need it installed first. Here is an example for Ubuntu installation:

```bash
$ sudo apt-get update
$ sudo apt-get install python-software-properties python g++ make
$ sudo add-apt-repository ppa:chris-lea/node.js
$ sudo apt-get update
$ sudo apt-get install nodejs
```

You can find the installation of Node.js for other distribution [on this GitHub document](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

### ucoin-web from git repository

And then, just install ucoin-web:

```bash
$ git clone git@github.com:c-geek/ucoin-web.git
$ cd ucoin-web && npm install
```

And launch it:

```bash
$ node app.js
```

### Configuration

#### Commande line parameters

```bash
$ node app.js --help

  Usage: app.js [options]

  Options:

    -h, --help           output usage information
    -p, --port <port>    Local port to listen
    -h, --host <host>    Local interface to listen
    -H, --uchost <host>  Host of ucoin server
    -P, --ucport <port>  Port of ucoin server
    -a, --auth           Enables authenticated mode
```

For example:

```bash
$ node app.js -h 127.0.0.7 -p 4444 --uchost localhost --ucport 8081 -a
```

Will launch the web interface on `http://127.0.0.7:4444/`, whose underlying uCoin server is `localhost:8081` with authenticated requests to uCoin server.

#### Configuration file

Just create a file `config.json` in your `conf/` folder with the following content:

```json
{
  "uchost": "localhost",
  "ucport": 8081,
  "host": "localhost",
  "port": 3000,
  "auth": true
}
```

And modify parameters according to your environment.

# License

This software is provided under [MIT license](https://raw.github.com/c-geek/ucoin/master/LICENSE).
