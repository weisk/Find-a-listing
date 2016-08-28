#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const polyline = require('polyline');
const moment = require('moment');
const geobuf = require('geobuf');
const Pbf = require('pbf');

let compressFile = (file, options) => {
    const fileData = fs.readFileSync(file)
    let data = JSON.parse(fileData);
    console.log(options.type);
    if (options.type === 'listedBuildings') {
        data.features.forEach((feature) => {
                let featureDate = feature.properties.ListDate;
                featureDate = featureDate.replace('\/', '-');
                const momentDate = moment(featureDate, 'YYYY-MM-DD');
                const listDate = momentDate.unix();
                feature.g = {
                    listEntry: parseInt(feature.properties.ListEntry),
                    name: feature.properties.Name,
                    grade: feature.properties.Grade,
                    listDate,
                };
                feature.g = {
                    t: feature.geometry.type,
                    c: feature.geometry.coordinates,
                };
                feature.t = feature.type;
                delete feature.type;
                delete feature.properties;
                delete feature.geometry;
        });
        data = JSON.stringify(data);
    } else if (options.type === 'HARlistedBuildings') {
        console.log('Processing HARlistedBuildings');
        data.features.forEach((feature) => {
                const riskurl = feature.properties.URL;
                const heurl = 'http:\/\/risk.HistoricEngland.org.uk\/register.aspx?id=';
                const riskId = parseInt(riskurl.replace(heurl, ''));
                feature.p = {
                    listEntry: parseInt(feature.properties.ListEntry),
                    riskId,
                    name: feature.properties.Published_,
                };
                feature.g = {
                    t: feature.geometry.type,
                    c: polyline.encode([feature.geometry.coordinates]),
                };
                feature.t = feature.type;
                delete feature.type;
                delete feature.properties;
                delete feature.geometry;
        });
        data = JSON.stringify(data);
    } else if (options.type === 'polyline') {
        data = geobuf.encode(data, new Pbf());
    }
    fs.writeFile(options.output, data, (error) => {
         if (error) {
           console.error(`Failed to write file: ${error.message}`);
         }
    });
};

program
  .version('0.0.1')
  .command('compress <file>')
  .description('Compress geojson, leaving only the necessary data')
  .option('-o, --output <file>', 'Output file')
  .option('-t, --type <geojson type>', 'Type of heritage geojson')
  .action(compressFile);

program.parse(process.argv);
