# XRP Ledger Python Library (xrpl-py)

## Introduction

`xrpl-py` is a pure Python implementation for interacting with the XRP Ledger (XRPL). It simplifies blockchain operations by providing native Python methods for transactions, serialization, transaction signing, and API objects. The library supports both synchronous and asynchronous operations.

**Key Features:**
- Transaction creation, signing, and submission
- Account management and wallet generation
- Real-time ledger monitoring via WebSocket
- Support for payments, tokens, and advanced features
- Testnet faucet integration for development
- Comprehensive address encoding/decoding utilities

---

## Installation

### Using pip
```bash
pip3 install xrpl-py
```

### Requirements
- Python 3.8 or later

---

## Quick Start

### 1. Create a Client Connection

```python
from xrpl.clients import JsonRpcClient

# Connect to testnet
JSON_RPC_URL = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(JSON_RPC_URL)

# For mainnet, use:
# JSON_RPC_URL = "https://s1.ripple.com:51234"
```

---

## Wallet Management

### Generate a New Wallet (Testnet)

```python
from xrpl.wallet import generate_faucet_wallet

# Generate wallet using testnet faucet (includes XRP funding)
test_wallet = generate_faucet_wallet(client, debug=True)
test_account = test_wallet.address

print("Classic address:", test_account)
print("Public key:", test_wallet.public_key)
# Private key is stored in wallet but hidden from print
```

### Create Wallet from Seed

```python
from xrpl.core import keypairs
import xrpl.wallet

# Generate new seed
seed = keypairs.generate_seed()
public, private = keypairs.derive_keypair(seed)
classic_address = keypairs.derive_classic_address(public)

print("Seed:", seed)
print("Public key:", public)
print("Private key:", private)  # Store this securely!
print("Classic address:", classic_address)

# Recreate wallet from existing seed
wallet_from_seed = xrpl.wallet.Wallet.from_seed(seed)
print(wallet_from_seed)
```

---

## Account Operations

### Check Account Balance

```python
from xrpl.account import get_balance

balance = get_balance(test_wallet.address, client)
print(f"Account balance: {balance} drops")  # 1 XRP = 1,000,000 drops
```

---

## Sending Payments

### Simple Payment Transaction

```python
from xrpl.models import Payment
from xrpl.transaction import submit_and_wait
from xrpl.account import get_balance

# Create a client and wallets
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
wallet1 = generate_faucet_wallet(client, debug=True)
wallet2 = generate_faucet_wallet(client, debug=True)

# Check initial balances
print("Initial balances:")
print(f"Wallet 1: {get_balance(wallet1.address, client)} drops")
print(f"Wallet 2: {get_balance(wallet2.address, client)} drops")

# Create payment transaction (1000 drops = 0.001 XRP)
payment_tx = Payment(
    account=wallet1.address,
    amount="1000",
    destination=wallet2.address,
)

# Submit and wait for validation
payment_response = submit_and_wait(payment_tx, client, wallet1)
print("Transaction submitted and validated!")

# Check final balances
print("Final balances:")
print(f"Wallet 1: {get_balance(wallet1.address, client)} drops")
print(f"Wallet 2: {get_balance(wallet2.address, client)} drops")
```

### Payment with Auto-Fill

The `autofill_and_sign` function automatically fills in required fields like fee, sequence, and last_ledger_sequence:

```python
from xrpl.models.transactions import Payment
from xrpl.transaction import submit_and_wait, autofill_and_sign

# Prepare payment (amount in drops)
my_payment = Payment(
    account=test_wallet.address,
    amount="2200000",  # 2.2 XRP
    destination="rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"
)

# Auto-fill and sign
signed_payment = autofill_and_sign(my_payment, client, test_wallet)
print("Transaction details:", signed_payment)

# Submit transaction
tx_response = submit_and_wait(signed_payment, client)
print("Response:", tx_response.result)
```

### Manual Transaction Preparation

```python
from xrpl.models.transactions import Payment
from xrpl.transaction import sign, submit_and_wait
from xrpl.ledger import get_latest_validated_ledger_sequence
from xrpl.account import get_next_valid_seq_number

# Get current ledger info
current_validated_ledger = get_latest_validated_ledger_sequence(client)

# Create payment with all fields
payment = Payment(
    account=test_wallet.address,
    amount="2200000",
    destination="rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    last_ledger_sequence=current_validated_ledger + 20,
    sequence=get_next_valid_seq_number(test_wallet.address, client),
    fee="10",
)

# Sign and submit
signed_payment = sign(payment, test_wallet)
tx_response = submit_and_wait(signed_payment, client)
```

---

## Transaction Verification

### Check Transaction Status

```python
from xrpl.models import Tx

# Look up transaction by hash
tx_response = client.request(Tx(transaction=payment_response.result["hash"]))

# Check validation status
print("Validated:", tx_response.result["validated"])
print("Transaction result:", tx_response.result)
```

---

## Network Information

### Get Current Transaction Fee

```python
from xrpl.ledger import get_fee

# Get current load-balanced fee
fee = get_fee(client)
print(f"Current fee: {fee} drops")
```

---

## Real-Time Monitoring (WebSocket)

### Subscribe to Ledger Updates

```python
from xrpl.clients import WebsocketClient
from xrpl.models import Subscribe, StreamParameter

url = "wss://s.altnet.rippletest.net/"

# Subscribe to ledger closure events
subscribe_request = Subscribe(streams=[StreamParameter.LEDGER])

# Listen for ledger updates (runs indefinitely)
with WebsocketClient(url) as ws_client:
    ws_client.send(subscribe_request)

    for message in ws_client:
        print(f"New ledger: {message.get('ledger_index')}")
        print(f"Ledger hash: {message.get('ledger_hash')}")
        print(f"Transaction count: {message.get('txn_count')}")
```

**Example Output:**
```python
# Initial response
{'result': {'fee_base': 10, 'fee_ref': 10, 'ledger_hash': '7CD50477...', 'ledger_index': 18183504, ...}, 'status': 'success'}

# Subsequent ledger closures
{'ledger_hash': 'BAA743DA...', 'ledger_index': 18183505, 'ledger_time': 676412970, 'txn_count': 0, 'type': 'ledgerClosed'}
```

---

## Address Utilities

### Convert Classic Address to X-Address

```python
from xrpl.core import addresscodec

# Convert classic address to X-address format
testnet_xaddress = addresscodec.classic_address_to_xaddress(
    "rMPUKmzmDWEX1tQhzQ8oGFNfAEhnWNFwz",
    tag=0,
    is_test_network=True,
)
print(testnet_xaddress)
# Output: T7QDemmxnuN7a52A62nx2fxGPWcRahLCf3qaswfrsNW9Lps
```

---

## Asynchronous Operations

### Async Payment Submission

```python
import asyncio
from xrpl.models.transactions import Payment
from xrpl.asyncio.transaction import submit_and_wait
from xrpl.asyncio.ledger import get_latest_validated_ledger_sequence
from xrpl.asyncio.account import get_next_valid_seq_number
from xrpl.asyncio.clients import AsyncJsonRpcClient

async def submit_async_payment():
    # Create async client
    async_client = AsyncJsonRpcClient("https://s.altnet.rippletest.net:51234")

    # Get current ledger
    current_validated_ledger = await get_latest_validated_ledger_sequence(async_client)

    # Prepare payment
    payment = Payment(
        account=test_wallet.address,
        amount="2200000",
        destination="rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
        last_ledger_sequence=current_validated_ledger + 20,
        sequence=await get_next_valid_seq_number(test_wallet.address, async_client),
        fee="10",
    )

    # Submit and wait
    tx_response = await submit_and_wait(payment, async_client, test_wallet)
    print(f"Transaction submitted: {tx_response}")

# Run async function
asyncio.run(submit_async_payment())
```

---

## Use Case Scenarios

### 1. **Payment Application**
**Scenario:** Build a remittance app for cross-border payments

```python
from xrpl.clients import JsonRpcClient
from xrpl.models import Payment
from xrpl.transaction import autofill_and_sign, submit_and_wait
from xrpl.account import get_balance
import xrpl.wallet

class PaymentApp:
    def __init__(self, network_url):
        self.client = JsonRpcClient(network_url)

    def send_payment(self, sender_wallet, recipient_address, amount_xrp):
        """Send XRP payment from sender to recipient"""
        # Convert XRP to drops
        amount_drops = str(int(float(amount_xrp) * 1_000_000))

        # Create payment transaction
        payment = Payment(
            account=sender_wallet.address,
            amount=amount_drops,
            destination=recipient_address,
        )

        # Sign and submit
        signed_tx = autofill_and_sign(payment, self.client, sender_wallet)
        response = submit_and_wait(signed_tx, self.client)

        return {
            'success': response.is_successful(),
            'hash': response.result.get('hash'),
            'validated': response.result.get('validated')
        }

    def get_account_balance(self, address):
        """Get account balance in XRP"""
        balance_drops = get_balance(address, self.client)
        return float(balance_drops) / 1_000_000

# Usage
app = PaymentApp("https://s.altnet.rippletest.net:51234")
sender = xrpl.wallet.Wallet.from_seed("sEdT...")  # Your seed

result = app.send_payment(sender, "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", 5.0)
print(f"Payment sent: {result}")
```

### 2. **Account Monitor**
**Scenario:** Monitor account activity in real-time

```python
from xrpl.clients import WebsocketClient
from xrpl.models import Subscribe

class AccountMonitor:
    def __init__(self, websocket_url, account_address):
        self.url = websocket_url
        self.account = account_address

    def start_monitoring(self):
        """Monitor account for incoming transactions"""
        with WebsocketClient(self.url) as client:
            # Subscribe to account transactions
            subscribe = Subscribe(accounts=[self.account])
            client.send(subscribe)

            print(f"Monitoring account: {self.account}")

            for message in client:
                if message.get('type') == 'transaction':
                    tx = message.get('transaction', {})

                    if tx.get('Destination') == self.account:
                        print(f"\n💰 Incoming payment!")
                        print(f"   Amount: {int(tx.get('Amount', 0))/1_000_000} XRP")
                        print(f"   From: {tx.get('Account')}")
                        print(f"   Hash: {message.get('transaction').get('hash')}")

# Usage
monitor = AccountMonitor(
    "wss://s.altnet.rippletest.net/",
    "rYourAccountAddress"
)
# monitor.start_monitoring()  # Runs indefinitely
```

### 3. **Wallet Generator Service**
**Scenario:** Create secure wallets for new users

```python
from xrpl.core import keypairs
import xrpl.wallet
import json

class WalletGenerator:
    @staticmethod
    def create_wallet():
        """Generate a new secure wallet"""
        # Generate cryptographic seed
        seed = keypairs.generate_seed()
        public, private = keypairs.derive_keypair(seed)
        address = keypairs.derive_classic_address(public)

        return {
            'address': address,
            'seed': seed,  # Store securely!
            'public_key': public,
            # Never expose private key in production
        }

    @staticmethod
    def restore_wallet(seed):
        """Restore wallet from seed"""
        wallet = xrpl.wallet.Wallet.from_seed(seed)
        return {
            'address': wallet.address,
            'public_key': wallet.public_key,
        }

    @staticmethod
    def export_wallet(wallet_info, filepath):
        """Export wallet to encrypted file (simplified example)"""
        with open(filepath, 'w') as f:
            json.dump({
                'address': wallet_info['address'],
                # In production: encrypt the seed!
                'seed_encrypted': wallet_info['seed']
            }, f)

# Usage
generator = WalletGenerator()

# Create new wallet
new_wallet = generator.create_wallet()
print(f"New wallet address: {new_wallet['address']}")
print(f"Seed (KEEP SECURE!): {new_wallet['seed']}")

# Restore from seed
restored = generator.restore_wallet(new_wallet['seed'])
print(f"Restored address: {restored['address']}")
```

### 4. **Transaction Batch Processor**
**Scenario:** Process multiple payments efficiently

```python
from xrpl.clients import JsonRpcClient
from xrpl.models import Payment
from xrpl.transaction import autofill_and_sign, submit_and_wait
from xrpl.account import get_next_valid_seq_number
import time

class BatchPaymentProcessor:
    def __init__(self, client, sender_wallet):
        self.client = client
        self.wallet = sender_wallet

    def process_payments(self, payment_list):
        """
        Process multiple payments
        payment_list: [{'destination': 'rXXX...', 'amount_xrp': 1.5}, ...]
        """
        results = []

        for idx, payment_info in enumerate(payment_list):
            try:
                # Convert XRP to drops
                amount = str(int(float(payment_info['amount_xrp']) * 1_000_000))

                # Create payment
                payment = Payment(
                    account=self.wallet.address,
                    amount=amount,
                    destination=payment_info['destination'],
                )

                # Sign and submit
                signed = autofill_and_sign(payment, self.client, self.wallet)
                response = submit_and_wait(signed, self.client)

                results.append({
                    'index': idx,
                    'destination': payment_info['destination'],
                    'amount': payment_info['amount_xrp'],
                    'success': response.is_successful(),
                    'hash': response.result.get('hash')
                })

                print(f"✓ Payment {idx+1}/{len(payment_list)} sent")

                # Small delay between transactions
                time.sleep(1)

            except Exception as e:
                results.append({
                    'index': idx,
                    'destination': payment_info['destination'],
                    'success': False,
                    'error': str(e)
                })
                print(f"✗ Payment {idx+1} failed: {e}")

        return results

# Usage
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
sender = xrpl.wallet.Wallet.from_seed("sEdT...")

processor = BatchPaymentProcessor(client, sender)

payments = [
    {'destination': 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe', 'amount_xrp': 1.5},
    {'destination': 'rN7n7otQDd6FczFgLdlqtyMVrn3HMgkk1q', 'amount_xrp': 2.0},
    {'destination': 'rLHzPsX6oXkzU9rFyxZqBkqfPt3zK5Q4F7', 'amount_xrp': 0.5},
]

results = processor.process_payments(payments)
print(f"\nProcessed {len(results)} payments")
print(f"Successful: {sum(1 for r in results if r.get('success'))}")
```

### 5. **Balance Checker Bot**
**Scenario:** Automated balance monitoring and alerts

```python
from xrpl.clients import JsonRpcClient
from xrpl.account import get_balance
import time

class BalanceMonitor:
    def __init__(self, client, account_address, threshold_xrp):
        self.client = client
        self.account = account_address
        self.threshold = float(threshold_xrp) * 1_000_000  # Convert to drops

    def check_balance(self):
        """Check current balance"""
        balance = float(get_balance(self.account, self.client))
        balance_xrp = balance / 1_000_000
        return balance, balance_xrp

    def monitor_with_alerts(self, check_interval=60):
        """Monitor balance and alert on threshold"""
        print(f"Monitoring account: {self.account}")
        print(f"Alert threshold: {self.threshold/1_000_000} XRP")

        while True:
            balance_drops, balance_xrp = self.check_balance()

            print(f"Current balance: {balance_xrp:.6f} XRP")

            if balance_drops < self.threshold:
                print(f"⚠️  ALERT: Balance below threshold!")
                print(f"   Current: {balance_xrp:.6f} XRP")
                print(f"   Threshold: {self.threshold/1_000_000} XRP")
                # In production: send email/SMS/notification

            time.sleep(check_interval)

# Usage
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

monitor = BalanceMonitor(
    client,
    "rYourAccountAddress",
    threshold_xrp=10.0  # Alert if balance falls below 10 XRP
)

# monitor.monitor_with_alerts(check_interval=300)  # Check every 5 minutes
```

---

## Best Practices

1. **Security:**
   - Never expose private keys or seeds in logs or code
   - Store seeds encrypted in production
   - Use environment variables for sensitive data

2. **Error Handling:**
   - Always check `response.is_successful()` after transactions
   - Handle network errors gracefully
   - Implement retry logic for critical operations

3. **Testing:**
   - Use testnet for development: `https://s.altnet.rippletest.net:51234`
   - Use faucet wallets to get free test XRP
   - Mainnet: `https://s1.ripple.com:51234` or `https://s2.ripple.com:51234`

4. **Performance:**
   - Use `autofill_and_sign()` for simplicity
   - Use async client for high-throughput applications
   - Cache client connections when possible

5. **Amount Handling:**
   - Always work in drops (1 XRP = 1,000,000 drops)
   - Use string type for amounts to avoid floating-point errors
   - Minimum account reserve: 10 XRP

---

## Resources

- **GitHub Repository:** https://github.com/XRPLF/xrpl-py
- **Official Documentation:** https://xrpl-py.readthedocs.io/
- **XRP Ledger Dev Portal:** https://xrpl.org/
- **Testnet Faucet:** https://faucet.altnet.rippletest.net/
- **Explorer (Testnet):** https://testnet.xrpl.org/

---

## Common Issues & Solutions

### Issue: "Account not found"
- **Solution:** Ensure account is funded (minimum 10 XRP reserve)

### Issue: "Insufficient XRP"
- **Solution:** Check balance includes fees and reserves

### Issue: "Sequence number error"
- **Solution:** Use `get_next_valid_seq_number()` or `autofill_and_sign()`

### Issue: "Transaction failed"
- **Solution:** Check `last_ledger_sequence` is not too far in future (max 20)

---

## Summary

`xrpl-py` provides a comprehensive, Pythonic interface to the XRP Ledger. Whether you're building payment apps, monitoring accounts, or managing wallets, the library offers both simple high-level APIs and fine-grained control for advanced use cases.

Start with the testnet, experiment with the examples above, and gradually build more sophisticated applications as you become familiar with the XRP Ledger ecosystem.
