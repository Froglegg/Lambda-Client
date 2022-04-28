import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import {
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  Stack,
  FormControl,
  Grid,
  HStack,
  Input,
  Text,
  theme,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

import ResultsTable from './Table';

const ENDPOINT = 'http://localhost:4000';
const socket = io(ENDPOINT);

function App() {
  const [state, setState] = useState({
    messageSending: false,
    messagePolling: false,
    nDecimals: 2,
    nChunks: 2,
    useMultiProcessing: true,
    testText: '',
  });

  const [data, setData] = useState({});

  const handleChange = (property, value) => {
    setState(s => {
      return {
        ...s,
        [property]: value,
      };
    });
  };

  const handleSubmit = async state => {
    handleChange('messageSending', true);
    const body = JSON.stringify({
      nDecimals: state.nDecimals,
      nChunks: state.nChunks,
      useMultiProcessing: state.useMultiProcessing,
    });
    return await fetch('sqs/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
      .then(res => {
        handleChange('messageSending', false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    socket.on('messageProcessed', res => {
      console.log(res);

      const receiptHandle = res.ReceiptHandle;
      const messageBody = JSON.parse(res.Body);

      const {
        body = [],
        time_elapsed = 0,
        use_multi_processing = true,
      } = messageBody;

      setData(s => {
        return {
          ...s,
          [receiptHandle]: {
            id: receiptHandle,
            data: body,
            name: receiptHandle.slice(receiptHandle.length - 10),
            timeElapsed: time_elapsed,
            useMultiProcessing: use_multi_processing,
          },
        };
      });
    });
    return () => {
      socket.off('messageProcessed');
      socket.disconnect();
    };
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl" maxWidth={'100vw'}>
        <Grid minH="100vh" p={8} maxWidth={'100vw'} w={'100vw'}>
          <VStack spacing={8} p={2}>
            <h1>SQS / Lambda Messenger</h1>
            <Text>
              Send a message to the SQS queue for the calculate pi lamdbda
              function, input number of decimal places and number of chunks to
              process, and receive pi results as well as execution times.
            </Text>
            <HStack spacing={4}>
              <FormControl>
                <Input
                  value={state.nDecimals}
                  onChange={e =>
                    handleChange('nDecimals', parseInt(e.target.value))
                  }
                  id="nDecimals"
                  type="number"
                  placeholder="# of decimal places"
                />
              </FormControl>
              <FormControl justifyContent={'center'}>
                <Input
                  value={state.nChunks}
                  onChange={e =>
                    handleChange('nChunks', parseInt(e.target.value))
                  }
                  id="nChunks"
                  type="number"
                  placeholder="# of processes"
                />
              </FormControl>
            </HStack>
            <Checkbox
              isChecked={state.useMultiProcessing}
              onChange={e =>
                handleChange('useMultiProcessing', e.target.checked)
              }
            >
              Use Multi-Processing
            </Checkbox>
            <Button
              onClick={() => handleSubmit(state)}
              isLoading={state.messageSending}
              colorScheme="teal"
              variant="solid"
            >
              Submit
            </Button>
          </VStack>
          <hr />
          <Wrap spacing={8} padding={4}>
            {Object.keys(data).map((tableKey, idx) => {
              const tableData = data[tableKey];

              return (
                <WrapItem border={'2px'}>
                  <ResultsTable
                    idx={idx}
                    data={tableData.data}
                    id={tableData.id}
                    key={tableKey}
                    name={tableData.name}
                    timeElapsed={tableData.timeElapsed}
                    useMultiProcessing={tableData.useMultiProcessing}
                  />
                </WrapItem>
              );
            })}
          </Wrap>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
