import random

def generate_iban(country_code: str = "ML", bank_code: str = "12345", branch_code: str = "00001") -> str:
    """
    Generate a formatted IBAN for XAALISI Mali accounts.
    Format ML25 1234 5000 0101 2345 6789 01
    """
    account_number = "".join([str(random.randint(0, 9)) for _ in range(12)])
    rib_key = str(random.randint(10, 99))
    
    # Simple mock IBAN generation
    bban = f"{bank_code}{branch_code}{account_number}{rib_key}"
    iban = f"{country_code}{random.randint(10, 99)}{bban}"
    
    return iban

def format_iban(iban: str) -> str:
    """Format IBAN into groups of 4 characters."""
    return " ".join(iban[i:i+4] for i in range(0, len(iban), 4))
