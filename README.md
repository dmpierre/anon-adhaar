### Description

This repository contains all necessary code for running the [anonymous adhaar app](https://anon-adhaar.vercel.app/). 

It allows [adhaar](https://en.wikipedia.org/wiki/Aadhaar) users to prove the ownership of a valid card, without divulging any data about it. Leveraging zero-knowledge under the hood, holders will be able to submit their proofs for verification in a variety of contexts, ranging from centralized servers to decentralized execution layers.

### How to use this repo

The repository root consists of the anonymous adhaar frontend code. `circom-rsa-verify` contains circuits for proving valid RSA signatures. 

We tweaked the [original circom-rsa-verify repo](https://github.com/zkp-application/circom-rsa-verify) and its circuits to adapt to the `sha1` function being used with adhaar cards.

- Frontend setup:
   - Install all necessary dependencies by running `yarn install` at the repo's root.

- `circom-rsa-verify` setup (not needed if you do not need to generate your own zkeys. For installing any dependencies in this folder, prefer `npm`):
   - `cd circom-rsa-verify && git submodule update --init --recursive && npm install`
   - Configuring your own `zkeys`: follow steps laid out in the `package.json` file.

### Acknowledgements

This work has been done under a [Privacy and Scaling Explorations](https://appliedzkp.org/) grant.