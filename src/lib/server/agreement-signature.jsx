import React from 'react';
import { Image, Text, View, StyleSheet } from '@react-pdf/renderer';
import format from 'date-fns/format';

export const signatureStyles = StyleSheet.create({
  signatureBlock: {
    marginTop: 28,
    alignItems: 'flex-start',
  },
  signatureImage: {
    width: 120,
    maxHeight: 48,
    objectFit: 'contain',
    objectPosition: 'left center',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  signerName: {
    fontSize: 10,
    marginBottom: 4,
  },
  signerDate: {
    fontSize: 9,
    color: '#4b5563',
  },
});

export const formatSignedAt = (signedAt) => {
  const date = signedAt ? new Date(signedAt) : new Date();
  if (Number.isNaN(date.getTime())) {
    return format(new Date(), 'MMMM d, yyyy');
  }
  return format(date, 'MMMM d, yyyy');
};

export const AgreementSignatureBlock = ({
  signatureBytes,
  signerName,
  signedAt,
}) => (
  <View style={signatureStyles.signatureBlock} wrap={false}>
    {signatureBytes ? (
      <Image src={signatureBytes} style={signatureStyles.signatureImage} />
    ) : null}
    <Text style={signatureStyles.signerName}>{signerName || '—'}</Text>
    <Text style={signatureStyles.signerDate}>
      Date: {formatSignedAt(signedAt)}
    </Text>
  </View>
);
