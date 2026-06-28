use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Status {
    Pending = 0,
    Funded = 1,
    Delivered = 2,
    Completed = 3,
    Refunded = 4,
}

#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub token: Address,
    pub amount: i128,
    pub description: String,
    pub status: Status,
    pub created_at: u64,
}
