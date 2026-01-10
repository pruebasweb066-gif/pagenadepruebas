const btn = document.getElementById("btn");
const status = document.getElementById("status");

let web3Modal;
let provider;
let signer;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider.default,
    options: {
      rpc: {
        1: "https://rpc.ankr.com/eth"
      }
    }
  }
};

window.addEventListener("load", () => {
  web3Modal = new Web3Modal.default({
    cacheProvider: false,
    providerOptions
  });
});

async function connectWallet() {
  try {
    const instance = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();

    const address = await signer.getAddress();
    status.innerHTML = `Conectado:<br>${address}`;
    btn.textContent = "Desconectar";

    instance.on("disconnect", resetUI);

  } catch (err) {
    console.error(err);
  }
}

async function disconnectWallet() {
  if (provider?.provider?.disconnect) {
    await provider.provider.disconnect();
  }
  resetUI();
}

function resetUI() {
  provider = null;
  signer = null;
  status.innerHTML = "";
  btn.textContent = "Conectar Wallet";
}

btn.onclick = () => {
  if (!provider) connectWallet();
  else disconnectWallet();
};
