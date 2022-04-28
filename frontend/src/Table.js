import React, { useState, useEffect, useMemo } from 'react';

import {
  Table,
  TableContainer,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
export default function ResultsTable(props) {
  const {
    data = [],
    id = '',
    name = '',
    timeElapsed = '',
    useMultiProcessing = true,
    idx = 0,
  } = props;
  const type = useMultiProcessing ? `Paralell` : `Sequential`;
  const nDecimals = data.length;
  return (
    <TableContainer key={id}>
      <Table variant={'simple'} size={'md'}>
        <TableCaption fontSize={'2xl'}>
          N = {nDecimals} {type} total: {timeElapsed} ms
        </TableCaption>
        <Thead>
          <Tr>
            <Th>
              {' '}
              Results for {type} job {idx}
            </Th>
          </Tr>
          <Tr>
            <Th># decimals</Th>
            <Th>Pi</Th>
            <Th isNumeric>elapsed (ms)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(row => {
            return (
              <Tr>
                <Td>{row.n}</Td>
                <Td>{row.pi}</Td>
                <Td isNumeric>{row.elapsed_ms}</Td>
              </Tr>
            );
          })}
        </Tbody>
        <Tfoot></Tfoot>
      </Table>
    </TableContainer>
  );
}
