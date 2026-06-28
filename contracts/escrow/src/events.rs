use soroban_sdk::{symbol_short, Address, Env};

const ESCROW: soroban_sdk::Symbol = symbol_short!("escrow");

pub fn created(env: &Env, id: u64, buyer: &Address, seller: &Address, amount: i128) {
    env.events().publish(
        (ESCROW, symbol_short!("created"), id),
        (buyer.clone(), seller.clone(), amount),
    );
}

pub fn funded(env: &Env, id: u64, amount: i128) {
    env.events()
        .publish((ESCROW, symbol_short!("funded"), id), amount);
}

pub fn delivered(env: &Env, id: u64, seller: &Address) {
    env.events()
        .publish((ESCROW, symbol_short!("delivered"), id), seller.clone());
}

pub fn completed(env: &Env, id: u64, seller: &Address, amount: i128) {
    env.events().publish(
        (ESCROW, symbol_short!("completed"), id),
        (seller.clone(), amount),
    );
}

pub fn refunded(env: &Env, id: u64, buyer: &Address, amount: i128) {
    env.events().publish(
        (ESCROW, symbol_short!("refunded"), id),
        (buyer.clone(), amount),
    );
}
