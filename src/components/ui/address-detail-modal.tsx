'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Modal } from './modal';
import { Api } from '@/api/generated/wt-backend-api';
import type { AddressInfo } from '@/api/generated/wt-backend-api';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Copy,
  ExternalLink,
  Loader2,
  ServerCrash,
} from 'lucide-react';
import { Button } from './button';

const apiClient = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

interface AddressDetailModalProps {
  address: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatBtcDisplay = (value: number) => {
  if (value >= 10000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

function InfoRow({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-muted/50 rounded-lg text-muted-foreground">
          {icon}
        </div>
        <span className="font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 font-semibold text-foreground">
        <span>{value}</span>
        {unit && <span className="text-sm font-normal text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

export function AddressDetailModal({ address, isOpen, onClose }: AddressDetailModalProps) {
  const [data, setData] = useState<AddressInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && address) {
      const fetchAddressInfo = async () => {
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
          const response = await apiClient.api.addressInfoApiAddressInfoGet({ address });
          setData(response.data);
        } catch (err) {
          setError('주소 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.');
          console.error('Failed to fetch address info:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAddressInfo();
    }
  }, [isOpen, address]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">주소 정보를 조회하고 있습니다...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ServerCrash className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-500">오류 발생</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      );
    }

    if (data) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm text-muted-foreground mb-1">지갑 주소</h3>
            <div className="flex items-center justify-between gap-4">
              <code className="text-base font-medium text-foreground truncate">{data.address}</code>
              <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="주소 복사">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-border">
            <InfoRow
              icon={<Wallet className="w-5 h-5" />}
              label="현재 잔고"
              value={formatBtcDisplay(data.final_balance_btc)}
              unit="BTC"
            />
            <InfoRow
              icon={<ArrowDownCircle className="w-5 h-5 text-blue-500" />}
              label="총 수신"
              value={formatBtcDisplay(data.total_received_btc)}
              unit="BTC"
            />
            <InfoRow
              icon={<ArrowUpCircle className="w-5 h-5 text-orange-500" />}
              label="총 송신"
              value={formatBtcDisplay(data.total_sent_btc)}
              unit="BTC"
            />
            <InfoRow
              icon={<History className="w-5 h-5" />}
              label="총 거래 횟수"
              value={data.tx_count.toLocaleString()}
              unit="회"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="지갑 주소 상세 정보" size="md">
      <div className="p-1">{renderContent()}</div>
      {data && (
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <a
              href={`https://www.blockchain.com/explorer/addresses/btc/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Blockchain.com에서 보기 <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      )}
    </Modal>
  );
}
