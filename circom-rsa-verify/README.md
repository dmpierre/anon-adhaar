### Important notice

This repository is a modified version of [circom-rsa-verify](https://github.com/zkp-application/circom-rsa-verify). 

### Instructions

1. Setup repo: `cd circom-rsa-verify && git submodule update --init --recursive && npm install`. 
2. Run tests: `npm run test:sha1`
3. Generate your proving and verification `zkeys` using the script located in `generateZkeys.ts`
