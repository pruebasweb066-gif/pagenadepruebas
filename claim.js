const btn = document.getElementById("btn");
const status = document.getElementById("status");

let provider = null;

async function connectWallet() {
  try {
    provider = new WalletConnectProvider.default({
      rpc: {
        1: "https://rpc.ankr.com/eth",        // Ethereum Mainnet
        5: "https://rpc.ankr.com/eth_goerli"  // Goerli Testnet
      },
      qrcode: true
    });

    // Mostrar QR y conectar
    await provider.enable();

    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    status.innerHTML = `Conectado: <br>${address}`;
    btn.textContent = "Desconectar";

    // Escuchar desconexión
    provider.on("disconnect", () => {
      resetUI();
    });

    // Si el usuario cambia cuentas
    provider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) resetUI();
      else status.innerHTML = `Conectado: <br>${accounts[0]}`;
    });

  } catch (error) {
    console.error(error);
    status.innerHTML = "No se pudo conectar.";
  }
}

async function disconnectWallet() {
  if (provider) {
    await provider.disconnect();
    resetUI();
  }
}

function resetUI() {
  provider = null;
  status.innerHTML = "";
  btn.textContent = "Conectar Wallet";
}

btn.addEventListener("click", () => {
  if (!provider) connectWallet();
  else disconnectWallet();
});

