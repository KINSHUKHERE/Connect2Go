import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = '964619523318325';
const apiSecret = 'Z5vyOsIzeh5DcNsdiSH0g2m6mTY';

const candidates = [
  'connect2go',
  'connect-2-go',
  'connect_2_go',
  'kinshuk',
  'connect2-go'
];

async function testCandidate(name) {
  cloudinary.config({
    cloud_name: name,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  return new Promise((resolve) => {
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.log(`❌ "${name}":`, error.message);
        resolve(false);
      } else {
        console.log(`🎉 SUCCESS! Cloud Name is: "${name}"`, result);
        resolve(true);
      }
    });
  });
}

async function run() {
  for (const c of candidates) {
    const ok = await testCandidate(c);
    if (ok) break;
  }
}

run();
