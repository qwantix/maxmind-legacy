Maxmind Legacy
=======================
Simple maxmind wrapper for legacy files.


This package allow to use legacy maxmind files like new geoip2 format.
This package include `maxmind@0.6` package, so, you can use both formats in same project.

Use this package like [maxmind](https://github.com/runk/node-maxmind) package at version 1.3 



## Usage

```javascript
const maxmind = require('maxmind'); 
const maxmindLegacy = require('maxmind-legacy'); 

const IP = '00.00.00.00';

/* Here, we have the new geoip2 format ( *.mmdb), so we use last maxmind package */
const geoCountry = maxmind.open('resources/GeoIP2-Country.mmdb');
console.log( geoCountry.get( IP ) );


/* And here, we have the legacy file format (*.dat), so we use maxmind-legacy */
const geoIsp = maxmindLegacy.open('resources/GeoIPISP.dat' );
console.log( geoIsp.get( IP ) );

```


## TODO
 - map cache options
