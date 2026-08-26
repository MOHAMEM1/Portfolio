import random

def generate_luhn_number(length: int, prefix: str = "4") -> str:
    """
    Generate a valid card number using the Luhn algorithm.
    Prefix: '4' for Visa, '5' for Mastercard.
    """
    # Create the initial parts of the card number
    number = prefix
    while len(number) < (length - 1):
        number += str(random.randint(0, 9))
    
    # Calculate the Luhn checksum digit
    sum_ = 0
    alt = True
    for i in range(len(number) - 1, -1, -1):
        digit = int(number[i])
        if alt:
            digit *= 2
            if digit > 9:
                digit -= 9
        sum_ += digit
        alt = not alt
        
    checksum = (10 - (sum_ % 10)) % 10
    return number + str(checksum)

def generate_virtual_card(card_type: str = "VIRTUAL") -> dict:
    """
    Generate a full virtual card dictionary.
    """
    import datetime
    
    prefix = "4" if random.choice([True, False]) else "5"
    card_number = generate_luhn_number(16, prefix)
    
    # Expiration date: 3 years from now
    now = datetime.datetime.now()
    exp_year = now.year + 3
    exp_month = now.month
    expiration_date = f"{exp_month:02d}/{str(exp_year)[-2:]}"
    
    cvv = str(random.randint(100, 999))
    
    return {
        "card_number": card_number,
        "expiration_date": expiration_date,
        "cvv": cvv,
        "card_type": card_type,
        "status": "ACTIVE",
        "daily_limit": 100000.0
    }
