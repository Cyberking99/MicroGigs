import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import TaskFactoryABI from '@/lib/abis/TaskFactory.json';
import { Address } from 'viem';

type UserProfile = {
  memberSince: bigint;
  tasksCompleted: bigint;
  tasksPosted: bigint;
  totalEarned: bigint;
  totalSpent: bigint;
  averageRating: number;
  ratingsCount: bigint;
};

const MICROGIGS_HUB_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export function useGetUserProfile(userAddress: Address | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setLoading] = useState<boolean>(true);
  const [profileError, setError] = useState<string | null>(null);

  const { 
    data: profileData, 
    isError, 
    isLoading,
    refetch
  } = useReadContract({
    address: MICROGIGS_HUB_ADDRESS,
    abi: TaskFactoryABI,
    functionName: 'getUserProfile',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else if (isError) {
      setLoading(false);
      setError('Failed to fetch user profile');
      setProfile(null);
    } else if (profileData) {
      setLoading(false);
      setError(null);
      
      // Process the returned data from the contract
      // The contract returns a tuple with 7 values
      const formattedProfile: UserProfile = {
        memberSince: profileData[0],
        tasksCompleted: profileData[1],
        tasksPosted: profileData[2],
        totalEarned: profileData[3],
        totalSpent: profileData[4],
        averageRating: Number(profileData[5]),
        ratingsCount: profileData[6]
      };
      
      setProfile(formattedProfile);
    }
  }, [isLoading, isError, profileData, userAddress]);

  // Refresh the profile data
  const refreshProfile = () => {
    if (userAddress) {
      refetch();
    }
  };

  return {
    profile,
    profileLoading,
    profileError,
    refreshProfile
  };
}