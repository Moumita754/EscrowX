#![no_std]

//! PaymentVault contract.
//!
//! Securely custodies escrow funds. Only the Escrow contract (configured at
//! initialization) may move money: it calls `deposit`, `release` and `refund`
//! via Soroban cross-contract invocation. Direct user calls are rejected
//! because every mutating function requires the Escrow contract's own
//! authorization, which only it can provide for its sub-invocations.

mod errors;
mod events;
mod storage;

#[cfg(test)]
mod test;

pub use errors::VaultError;

use soroban_sdk::{contract, contractimpl, token, Address, Env};

#[contract]
pub struct PaymentVault;

#[contractimpl]
impl PaymentVault {
    /// One-time configuration: bind the vault to its Escrow contract and asset.
    pub fn initialize(env: Env, escrow: Address, token: Address) -> Result<(), VaultError> {
        if storage::is_initialized(&env) {
            return Err(VaultError::AlreadyInitialized);
        }
        storage::set_escrow(&env, &escrow);
        storage::set_token(&env, &token);
        Ok(())
    }

    /// Pull `amount` from `from` into the vault and lock it under `escrow_id`.
    /// Callable only by the Escrow contract.
    pub fn deposit(
        env: Env,
        escrow_id: u64,
        from: Address,
        amount: i128,
    ) -> Result<(), VaultError> {
        storage::get_escrow(&env)?.require_auth();

        if amount <= 0 {
            return Err(VaultError::InvalidAmount);
        }
        if storage::get_balance(&env, escrow_id) != 0 {
            return Err(VaultError::BalanceExists);
        }

        let token = storage::get_token(&env)?;
        token::Client::new(&env, &token).transfer(&from, &env.current_contract_address(), &amount);

        storage::set_balance(&env, escrow_id, amount);
        events::deposited(&env, escrow_id, &from, amount);
        Ok(())
    }

    /// Release the locked funds for `escrow_id` to the seller `to`.
    /// Callable only by the Escrow contract.
    pub fn release(env: Env, escrow_id: u64, to: Address) -> Result<(), VaultError> {
        storage::get_escrow(&env)?.require_auth();

        let amount = storage::get_balance(&env, escrow_id);
        if amount <= 0 {
            return Err(VaultError::InsufficientBalance);
        }

        let token = storage::get_token(&env)?;
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &to, &amount);

        storage::clear_balance(&env, escrow_id);
        events::released(&env, escrow_id, &to, amount);
        Ok(())
    }

    /// Refund the locked funds for `escrow_id` to the buyer `to`.
    /// Callable only by the Escrow contract.
    pub fn refund(env: Env, escrow_id: u64, to: Address) -> Result<(), VaultError> {
        storage::get_escrow(&env)?.require_auth();

        let amount = storage::get_balance(&env, escrow_id);
        if amount <= 0 {
            return Err(VaultError::InsufficientBalance);
        }

        let token = storage::get_token(&env)?;
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &to, &amount);

        storage::clear_balance(&env, escrow_id);
        events::refunded(&env, escrow_id, &to, amount);
        Ok(())
    }

    /// Currently locked balance for an escrow id.
    pub fn get_balance(env: Env, escrow_id: u64) -> i128 {
        storage::get_balance(&env, escrow_id)
    }

    /// Configured Escrow contract address.
    pub fn get_escrow(env: Env) -> Result<Address, VaultError> {
        storage::get_escrow(&env)
    }
}
