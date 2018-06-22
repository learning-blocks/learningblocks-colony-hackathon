// using the infura.io node, otherwise ipfs requires
// you to run a daemon on your own computer/server. See IPFS.io docs
// Not using the compiled version due to some compile issues with IPFS and webpack
//const IPFS = require('ipfs-api');

const ipfs = window.IpfsApi('ipfs.infura.io', '5001', { protocol: 'https' })

export default ipfs;
