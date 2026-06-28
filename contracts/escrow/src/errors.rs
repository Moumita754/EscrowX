use soroban_sdk::contracterror;

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum EscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    EscrowNotFound = 3,
    InvalidAmount = 4,
    SameBuyerSeller = 5,
    InvalidStatus = 6,
}
