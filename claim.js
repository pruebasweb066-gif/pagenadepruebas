const btn = document.getElementById("btn");
const status = document.getElementById("status");

let web3Modal = null;
let externalProvider = null;
let provider = null;
let signer = null;

/**
 * Configuración de proveedores
 * Esto es lo que hace que aparezca el selector de wallets
 */
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        1: "https://rpc.ankr.com/eth"
      }
    }
  }
};

/**
 * Inicializar Web3Modal cuando la página carga
 */
window.addEventListener("load", () => {
  web3Modal = new window.Web3Modal({
    cacheProvider: false,
    providerOptions
  });
});

/**
 * Conectar wallet
 */
async function connectWallet() {
  try {
    // Abre el modal de selección
    externalProvider = await web3Modal.connect();

    // Envolver con ethers
    provider = new ethers.providers.Web3Provider(externalProvider);
    signer = provider.getSigner();

    const address = await signer.getAddress();

    status.innerHTML = `Conectado:<br>${address}`;
    btn.textContent = "Desconectar";

    // Escuchar desconexión
    externalProvider.on("disconnect", resetUI);
    externalProvider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) resetUI();
      else status.innerHTML = `Conectado:<br>${accounts[0]}`;
    });

  } catch (err) {
    console.error(err);
    status.innerHTML = "Conexión cancelada";
  }
}

/**
 * Desconectar wallet
 */
async function disconnectWallet() {
  try {
    if (externalProvider?.disconnect) {
      await externalProvider.disconnect();
    }
  } catch (e) {
    // algunos wallets no soportan disconnect
  }
  resetUI();
}

/**
 * Resetear UI
 */
function resetUI() {
  externalProvider = null;
  provider = null;
  signer = null;
  status.innerHTML = "";
  btn.textContent = "Conectar Wallet";
}

/**
 * Botón
 */
btn.addEventListener("click", () => {
  if (!provider) connectWallet();
  else disconnectWallet();
});
