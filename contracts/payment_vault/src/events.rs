use soroban_sdk::{symbol_short, Address, Env};

const VAULT: soroban_sdk::Symbol = symbol_short!("vault");

pub fn deposited(env: &Env, escrow_id: u64, from: &Address, amount: i128) {
    env.events().publish(
        (VAULT, symbol_short!("deposit"), escrow_id),
        (from.clone(), amount),
    );
}

pub fn released(env: &Env, escrow_id: u64, to: &Address, amount: i128) {
    env.events().publish(
        (VAULT, symbol_short!("released"), escrow_id),
        (to.clone(), amount),
    );
}

pub fn refunded(env: &Env, escrow_id: u64, to: &Address, amount: i128) {
    env.events().publish(
        (VAULT, symbol_short!("refunded"), escrow_id),
        (to.clone(), amount),
    );
}
