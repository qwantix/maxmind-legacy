'use strict';

const net = require('net');

const maxmind = require('maxmind');
const Database = require('maxmind/lib/database');
const DatabaseInfo = require('maxmind/lib/database_info');


const lookupCtr = require('maxmind/lib/lookup/country');
const lookupLoc = require('maxmind/lib/lookup/location');
const lookupReg = require('maxmind/lib/lookup/region');
const lookupOrg = require('maxmind/lib/lookup/organization');


const cache = new Map();

function getAsV4( db, ip ) {
  const cs = maxmind.seekCountry( db, ip );
  switch( db.type ) {
    case DatabaseInfo.COUNTRY_EDITION:
    case DatabaseInfo.LARGE_COUNTRY_EDITION:
      return lookupCtr(db, cs);
    case DatabaseInfo.CITY_EDITION_REV0:
    case DatabaseInfo.CITY_EDITION_REV1:
      return lookupLoc(db, cs);
    case DatabaseInfo.REGION_EDITION_REV0:
    case DatabaseInfo.REGION_EDITION_REV1:
      return lookupReg(db, cs);
    case DatabaseInfo.ORG_EDITION:
    case DatabaseInfo.ASNUM_EDITION:
    case DatabaseInfo.NETSPEED_EDITION_REV1:
    case DatabaseInfo.ISP_EDITION:
    case DatabaseInfo.DOMAIN_EDITION:
    case DatabaseInfo.USERTYPE_EDITION:
    case DatabaseInfo.REGISTRAR_EDITION:
    case DatabaseInfo.ACCURACYRADIUS_EDITION:
    case DatabaseInfo.LOCATIONA_EDITION:
    case DatabaseInfo.CITYCONF_EDITION:
    case DatabaseInfo.COUNTRYCONF_EDITION:
    case DatabaseInfo.REGIONCONF_EDITION:
      return lookupOrg(db, cs);
  }
}

function getAsV6( db, ip ) {
  const cs = maxmind.seekCountryV6( db, ip );
  switch( db.type ) {
    case DatabaseInfo.COUNTRY_EDITION_V6:
    case DatabaseInfo.LARGE_COUNTRY_EDITION:
      return lookupCtr(db, cs);
    case DatabaseInfo.CITY_EDITION_REV0_V6:
    case DatabaseInfo.CITY_EDITION_REV1_V6:
      return lookupLoc(db, cs);
    case DatabaseInfo.REGION_EDITION_REV0_V6:
    case DatabaseInfo.REGION_EDITION_REV1_V6:
      return lookupReg(db, cs);
    case DatabaseInfo.ORG_EDITION_V6:
    case DatabaseInfo.ASNUM_EDITION_V6:
    case DatabaseInfo.NETSPEED_EDITION_REV1_V6:
    case DatabaseInfo.ISP_EDITION_V6:
    case DatabaseInfo.DOMAIN_EDITION_V6:
    case DatabaseInfo.USERTYPE_EDITION_V6:
    case DatabaseInfo.REGISTRAR_EDITION_V6:
    case DatabaseInfo.ACCURACYRADIUS_EDITION_V6:
    case DatabaseInfo.LOCATIONA_EDITION_V6:
    case DatabaseInfo.CITYCONF_EDITION_V6:
      return lookupOrg(db, cs);
  }
}

function format( ip, result, type ) {
  if( !result ) {
    return result;
  }

  const out = {
    legacy: true
  };
  if( result.city ) {
    out.city = {
      geoname_id: null,
      names: {
        en: result.city
      }
    };
  }

  if( result.postalCode ) {
    out.postal = {
      code: result.postalCode
    };
  }

  if( result.continentCode ) {
    out.continent = {
      geoname_id: null,
      code: result.continentCode,
      names: {}
    };
  }

  if( result.countryCode ) {
    out.registered_country = out.country = {
      geoname_id: null,
      iso_code: result.countryCode,
      names: {
        en: result.countryName
      }
    };
  }

  if( result.latitude ) {
    out.location = {
      latitude: result.latitude,
      longitude: result.longitude
    };
  }



  const traits = {
    ip
  };
  switch( type ) {
    case DatabaseInfo.ORG_EDITION:
    case DatabaseInfo.ORG_EDITION_V6:
      traits.organization = result;
      break;
    //case DatabaseInfo.ASNUM_EDITION:
    case DatabaseInfo.NETSPEED_EDITION_REV1:
    case DatabaseInfo.NETSPEED_EDITION_REV1_V6:
      out.connection_type = result;
      break;
    case DatabaseInfo.ISP_EDITION:
    case DatabaseInfo.ISP_EDITION_V6:
      traits.isp = result;
      break;
    case DatabaseInfo.DOMAIN_EDITION:
    case DatabaseInfo.DOMAIN_EDITION_V6:
      traits.domain = result;
      break;
    /*case DatabaseInfo.USERTYPE_EDITION:
    case DatabaseInfo.REGISTRAR_EDITION:
    case DatabaseInfo.ACCURACYRADIUS_EDITION:
    case DatabaseInfo.LOCATIONA_EDITION:
    case DatabaseInfo.CITYCONF_EDITION:
    case DatabaseInfo.COUNTRYCONF_EDITION:
    case DatabaseInfo.REGIONCONF_EDITION:*/

  }

  out.traits = traits;

  return out;
}

function createWrapper( file, opts ) {
  opts = opts || {};
  const db = new Database( file, opts );
  return {
    get( ip ) {
      if( net.isIPv6( ip ) ) {
        return format( ip, getAsV6( db, ip ), db.type );
      }
      else {
        return format( ip, getAsV4( db, ip ), db.type );
      }
    }
  };
}

module.exports = {
  open( file, opts ) {
    if( !cache.has( file ) ) {
      cache.set( file, createWrapper( file, opts ) );
    }
    return cache.get( file );
  },
  validate: maxmind.validate
};