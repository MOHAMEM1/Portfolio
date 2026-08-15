import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

/**
 * KYC Dynamic Ceilings — mirrors the backend kyc_ceilings table.
 * 
 * Backend pseudo-code for ceiling enforcement:
 * 
 *   def check_transaction(user, amount):
 *     ceiling = db.query(KycCeiling).filter_by(kyc_tier=user.kyc_tier).first()
 *     daily_total = db.query(sum(entries.amount)).filter(
 *       entries.user == user.username,
 *       entries.timestamp >= today_start
 *     ).scalar() or 0
 *     
 *     if daily_total + amount > ceiling.daily_limit:
 *       raise HTTPException(403, "Plafond journalier dépassé. Upgrade KYC requis.")
 *     
 *     monthly_total = db.query(sum(entries.amount)).filter(
 *       entries.user == user.username,
 *       entries.timestamp >= month_start
 *     ).scalar() or 0
 *     
 *     if monthly_total + amount > ceiling.monthly_limit:
 *       raise HTTPException(403, "Plafond mensuel dépassé. Upgrade KYC requis.")
 */

interface CeilingConfig {
  dailyLimit: number;
  monthlyLimit: number;
  label: string;
}

const CEILINGS: Record<number, CeilingConfig> = {
  1: { dailyLimit: 200000,   monthlyLimit: 500000,    label: 'Standard' },
  2: { dailyLimit: 2000000,  monthlyLimit: 10000000,  label: 'Vérifié' },
  3: { dailyLimit: 5000000,  monthlyLimit: 50000000,  label: 'Premium' },
};

export function useCeilingCheck(kycLevel: number = 1) {
  const [isBlocked, setIsBlocked] = useState(false);

  const ceiling = CEILINGS[kycLevel] || CEILINGS[1];
  const nextLevel = Math.min(kycLevel + 1, 3);

  /**
   * Check if a transaction amount exceeds the user's daily ceiling.
   * Returns true if the transaction is ALLOWED, false if BLOCKED.
   */
  const checkCeiling = useCallback((amount: number): boolean => {
    if (amount <= 0) return true;

    if (amount > ceiling.dailyLimit) {
      setIsBlocked(true);
      Alert.alert(
        'Plafond Dépassé',
        `Votre limite journalière est de ${ceiling.dailyLimit.toLocaleString()} FCFA (Niveau ${kycLevel} — ${ceiling.label}).\n\nPassez au Niveau ${nextLevel} pour des limites plus élevées.`,
        [
          { text: 'Plus tard', style: 'cancel', onPress: () => setIsBlocked(false) },
          { text: 'Passer au Niveau ' + nextLevel, onPress: () => { setIsBlocked(false); router.push('/kyc'); } },
        ]
      );
      return false;
    }

    setIsBlocked(false);
    return true;
  }, [kycLevel, ceiling]);

  return {
    checkCeiling,
    isBlocked,
    ceiling,
    kycLevel,
    nextLevel,
  };
}
