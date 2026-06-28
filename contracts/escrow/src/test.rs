#![cfg(test)]

use super::*;
use payment_vault::{PaymentVault, PaymentVaultClient};
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env, String,
};

struct Setup<'a> {
    env: Env,
    escrow: EscrowContractClient<'a>,
    vault: PaymentVaultClient<'a>,
    token: TokenClient<'a>,
    buyer: Address,
    seller: Address,
}

fn setup() -> Setup<'static> {
    let env = Env::default();

    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);

    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_address = sac.address();
    let token = TokenClient::new(&env, &token_address);

    let vault_id = env.register_contract(None, PaymentVault);
    let escrow_id = env.register_contract(None, EscrowContract);
    let vault = PaymentVaultClient::new(&env, &vault_id);
    let escrow = EscrowContractClient::new(&env, &escrow_id);

    env.mock_all_auths();
    StellarAssetClient::new(&env, &token_address).mint(&buyer, &1_000);

    // Wire the two contracts together (cross-contract relationship).
    vault.initialize(&escrow_id, &token_address);
    escrow.initialize(&vault_id, &token_address);

    Setup {
        env,
        escrow,
        vault,
        token,
        buyer,
        seller,
    }
}

fn create(s: &Setup) -> u64 {
    s.escrow.create_escrow(
        &s.buyer,
        &s.seller,
        &500,
        &String::from_str(&s.env, "Design work"),
    )
}

#[test]
fn test_create_escrow() {
    let s = setup();
    let id = create(&s);

    assert_eq!(id, 0);
    let escrow = s.escrow.get_escrow(&id);
    assert_eq!(escrow.buyer, s.buyer);
    assert_eq!(escrow.seller, s.seller);
    assert_eq!(escrow.amount, 500);
    assert_eq!(escrow.status, Status::Pending);
    assert_eq!(s.escrow.list_escrows().len(), 1);
}

#[test]
fn test_deposit_funds() {
    let s = setup();
    let id = create(&s);
    s.escrow.deposit_funds(&id);

    // Cross-contract effect: funds now custodied by the vault.
    assert_eq!(s.escrow.get_escrow(&id).status, Status::Funded);
    assert_eq!(s.vault.get_balance(&id), 500);
    assert_eq!(s.token.balance(&s.buyer), 500);
    assert_eq!(s.token.balance(&s.vault.address), 500);
}

#[test]
fn test_mark_delivered() {
    let s = setup();
    let id = create(&s);
    s.escrow.deposit_funds(&id);
    s.escrow.mark_delivered(&id);

    assert_eq!(s.escrow.get_escrow(&id).status, Status::Delivered);
}

#[test]
fn test_release_payment() {
    let s = setup();
    let id = create(&s);
    s.escrow.deposit_funds(&id);
    s.escrow.mark_delivered(&id);
    s.escrow.release_payment(&id);

    // Cross-contract effect: vault paid the seller.
    assert_eq!(s.escrow.get_escrow(&id).status, Status::Completed);
    assert_eq!(s.vault.get_balance(&id), 0);
    assert_eq!(s.token.balance(&s.seller), 500);
    assert_eq!(s.token.balance(&s.vault.address), 0);
}

#[test]
fn test_refund_payment() {
    let s = setup();
    let id = create(&s);
    s.escrow.deposit_funds(&id);
    s.escrow.refund_payment(&id);

    // Cross-contract effect: vault returned funds to the buyer.
    assert_eq!(s.escrow.get_escrow(&id).status, Status::Refunded);
    assert_eq!(s.vault.get_balance(&id), 0);
    assert_eq!(s.token.balance(&s.buyer), 1_000);
}

#[test]
#[should_panic]
fn test_unauthorized_buyer() {
    let s = setup();
    let id = create(&s);
    // Drop mocked auths: only the buyer may deposit, so this must fail.
    s.env.mock_auths(&[]);
    s.escrow.deposit_funds(&id);
}

#[test]
#[should_panic]
fn test_unauthorized_seller() {
    let s = setup();
    let id = create(&s);
    s.escrow.deposit_funds(&id);
    // Drop mocked auths: only the seller may mark delivered, so this must fail.
    s.env.mock_auths(&[]);
    s.escrow.mark_delivered(&id);
}

#[test]
fn test_invalid_status_transition() {
    let s = setup();
    let id = create(&s);
    // Cannot mark delivered before the escrow is funded.
    let result = s.escrow.try_mark_delivered(&id);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}

#[test]
fn test_no_double_release() {
    let s = setup();
    let id = create(&s);
    s.escrow.deposit_funds(&id);
    s.escrow.release_payment(&id);

    let result = s.escrow.try_release_payment(&id);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}

#[test]
fn test_no_refund_after_release() {
    let s = setup();
    let id = create(&s);
    s.escrow.deposit_funds(&id);
    s.escrow.release_payment(&id);

    let result = s.escrow.try_refund_payment(&id);
    assert_eq!(result, Err(Ok(EscrowError::InvalidStatus)));
}

#[test]
fn test_zero_amount_rejected() {
    let s = setup();
    let result = s.escrow.try_create_escrow(
        &s.buyer,
        &s.seller,
        &0,
        &String::from_str(&s.env, "Invalid"),
    );
    assert_eq!(result, Err(Ok(EscrowError::InvalidAmount)));
}
