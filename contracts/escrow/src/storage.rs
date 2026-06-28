use soroban_sdk::{contracttype, Address, Env};

use crate::errors::EscrowError;
use crate::types::Escrow;

#[contracttype]
pub enum DataKey {
    /// Address of the PaymentVault contract.
    Vault,
    /// Payment asset (Stellar Asset Contract) address.
    Token,
    /// Auto-incrementing escrow counter.
    Count,
    /// Stored escrow record by id.
    Escrow(u64),
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Vault)
}

pub fn set_vault(env: &Env, vault: &Address) {
    env.storage().instance().set(&DataKey::Vault, vault);
}

pub fn get_vault(env: &Env) -> Result<Address, EscrowError> {
    env.storage()
        .instance()
        .get(&DataKey::Vault)
        .ok_or(EscrowError::NotInitialized)
}

pub fn set_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::Token, token);
}

pub fn get_token(env: &Env) -> Result<Address, EscrowError> {
    env.storage()
        .instance()
        .get(&DataKey::Token)
        .ok_or(EscrowError::NotInitialized)
}

pub fn get_count(env: &Env) -> u64 {
    env.storage().instance().get(&DataKey::Count).unwrap_or(0)
}

pub fn set_count(env: &Env, count: u64) {
    env.storage().instance().set(&DataKey::Count, &count);
}

pub fn save_escrow(env: &Env, escrow: &Escrow) {
    env.storage()
        .persistent()
        .set(&DataKey::Escrow(escrow.id), escrow);
}

pub fn get_escrow(env: &Env, id: u64) -> Result<Escrow, EscrowError> {
    env.storage()
        .persistent()
        .get(&DataKey::Escrow(id))
        .ok_or(EscrowError::EscrowNotFound)
}

pub fn try_get_escrow(env: &Env, id: u64) -> Option<Escrow> {
    env.storage().persistent().get(&DataKey::Escrow(id))
}
