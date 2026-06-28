use soroban_sdk::{contracttype, Address, Env};

use crate::errors::VaultError;

#[contracttype]
pub enum DataKey {
    /// Address of the Escrow contract — the only authorized caller.
    Escrow,
    /// Payment asset (Stellar Asset Contract) address.
    Token,
    /// Locked balance held for a given escrow id.
    Balance(u64),
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Escrow)
}

pub fn set_escrow(env: &Env, escrow: &Address) {
    env.storage().instance().set(&DataKey::Escrow, escrow);
}

pub fn get_escrow(env: &Env) -> Result<Address, VaultError> {
    env.storage()
        .instance()
        .get(&DataKey::Escrow)
        .ok_or(VaultError::NotInitialized)
}

pub fn set_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::Token, token);
}

pub fn get_token(env: &Env) -> Result<Address, VaultError> {
    env.storage()
        .instance()
        .get(&DataKey::Token)
        .ok_or(VaultError::NotInitialized)
}

pub fn get_balance(env: &Env, escrow_id: u64) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Balance(escrow_id))
        .unwrap_or(0)
}

pub fn set_balance(env: &Env, escrow_id: u64, amount: i128) {
    env.storage()
        .persistent()
        .set(&DataKey::Balance(escrow_id), &amount);
}

pub fn clear_balance(env: &Env, escrow_id: u64) {
    env.storage()
        .persistent()
        .remove(&DataKey::Balance(escrow_id));
}
