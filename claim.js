// 🔹 Cambia esta dirección por la de tu contrato TokenX desplegado
const CONTRACT_ADDRESS = "0xTU_CONTRATO_TOKENX"; // ← tu dirección real
const ABI = [
  "function pendingRewards(address user) view returns (uint256)",
  "function claim()"
];

let provider;
let signer;
let contract;
let web3Modal;
let connection;

// Elementos de la página
const connectWalletBtn = document.getElementById("connectWallet");
const walletSpan = document.getElementById("wallet");
const pendingSpan = document.getElementById("pending");
const claimBtn = document.getElementById("claimButton");

// Inicializar Web3Modal
function initWeb3Modal() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider.default,
      options: {
        infuraId: "TU_INFURA_ID_AQUI" // ⚡ Tu Infura ID o RPC
      }
    }
  };

  web3Modal = new Web3Modal.default({
    cacheProvider: true,
    providerOptions
  });
}

// Conectar wallet usando Web3Modal
async function connectWallet() {
  try {
    connection = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(connection);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const walletAddress = await signer.getAddress();
    walletSpan.textContent = walletAddress;

    // Actualizar tokens cada 5s
    await updatePending();
    setInterval(updatePending, 5000);

    // Escuchar cambios de cuentas
    connection.on("accountsChanged", async (accounts) => {
      if (accounts.length === 0) {
        walletSpan.textContent = "No conectada";
      } else {
        walletSpan.textContent = accounts[0];
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        await updatePending();
      }
    });

    connection.on("disconnect", () => {
      walletSpan.textContent = "No conectada";
      pendingSpan.textContent = "0";
    });

  } catch (err) {
    console.error("Error al conectar wallet:", err);
    alert("Error al conectar wallet: " + err.message);
  }
}

// Mostrar tokens pendientes
async function updatePending() {
  if (!contract || !signer) return;

  try {
    const walletAddress = await signer.getAddress();
    const pending = await contract.pendingRewards(walletAddress);
    pendingSpan.textContent = ethers.utils.formatUnits(pending, 18);
  } catch (err) {
    console.error("Error al obtener tokens pendientes:", err);
    pendingSpan.textContent = "0";
  }
}

// Reclamar tokens
claimBtn.onclick = async () => {
  if (!contract) {
    alert("Conecta tu wallet primero");
    return;
  }

  try {
    const tx = await contract.claim();
    await tx.wait();
    alert("Tokens reclamados correctamente!");
    await updatePending();
  } catch (err) {
    console.error("Error al reclamar tokens:", err);
    alert("Error al reclamar tokens: " + err.message);
  }
};

// Eventos
connectWalletBtn.onclick = connectWallet;

// Inicializar Web3Modal al cargar
window.addEventListener("load", initWeb3Modal);
