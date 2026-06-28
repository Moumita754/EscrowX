#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env,
};

struct Setup<'a> {
    env: Env,
    vault: PaymentVaultClient<'a>,
    token: TokenClient<'a>,
    escrow: Address,
    buyer: Address,
    seller: Address,
}

fn setup() -> Setup<'static> {
    let env = Env::default();

    let admin = Address::generate(&env);
    let escrow = Address::generate(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);

    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_address = sac.address();
    let token = TokenClient::new(&env, &token_address);

    let vault_id = env.register_contract(None, PaymentVault);
    let vault = PaymentVaultClient::new(&env, &vault_id);

    // The vault is normally driven by the Escrow contract, which authorizes the
    // payer at the root invocation. These tests call the vault directly, so the
    // token transfer's `from.require_auth()` happens in a nested (non-root)
    // call. Allow non-root auth so mock auths cover it.
    env.mock_all_auths_allowing_non_root_auth();
    StellarAssetClient::new(&env, &token_address).mint(&buyer, &1_000);
    vault.initialize(&escrow, &token_address);

    Setup {
        env,
        vault,
        token,
        escrow,
        buyer,
        seller,
    }
}

#[test]
fn test_deposit() {
    let s = setup();
    s.vault.deposit(&1, &s.buyer, &500);

    assert_eq!(s.vault.get_balance(&1), 500);
    assert_eq!(s.token.balance(&s.buyer), 500);
    assert_eq!(s.token.balance(&s.vault.address), 500);
}

#[test]
fn test_release() {
    let s = setup();
    s.vault.deposit(&1, &s.buyer, &500);
    s.vault.release(&1, &s.seller);

    assert_eq!(s.vault.get_balance(&1), 0);
    assert_eq!(s.token.balance(&s.seller), 500);
    assert_eq!(s.token.balance(&s.vault.address), 0);
}

#[test]
fn test_refund() {
    let s = setup();
    s.vault.deposit(&1, &s.buyer, &500);
    s.vault.refund(&1, &s.buyer);

    assert_eq!(s.vault.get_balance(&1), 0);
    assert_eq!(s.token.balance(&s.buyer), 1_000);
}

#[test]
fn test_insufficient_balance() {
    let s = setup();
    let result = s.vault.try_release(&99, &s.seller);
    assert_eq!(result, Err(Ok(VaultError::InsufficientBalance)));
}

#[test]
#[should_panic]
fn test_reject_direct_call() {
    let s = setup();
    // Drop the mocked authorizations: a direct user call cannot provide the
    // Escrow contract's authorization, so `require_auth` must fail.
    s.env.mock_auths(&[]);
    s.vault.deposit(&1, &s.buyer, &500);
}

#[test]
fn test_reject_invalid_amount() {
    let s = setup();
    let result = s.vault.try_deposit(&1, &s.buyer, &0);
    assert_eq!(result, Err(Ok(VaultError::InvalidAmount)));
}

#[test]
fn test_double_initialize_rejected() {
    let s = setup();
    let result = s.vault.try_initialize(&s.escrow, &s.token.address);
    assert_eq!(result, Err(Ok(VaultError::AlreadyInitialized)));
}
