import React, {useEffect, useState} from 'react';
import { Input, Form, FormGroup, Label, Button, InputGroup, InputGroupAddon } from 'reactstrap';
import Select from 'react-select';

type CompoundData = {
  num: number,
  coin: Coin
}

type Coin = {
  name: string,
  price: number
} | null

type CryptoSelectOption = {
  value: Coin,
  label: string
}

type FreqSelectOption = {
  value: number,
  label: string
}

type RegularContribution = {
  amount: number,
  frequency: number
}

type TickerResponse = {
  symbol: string,
  price: string
}

const freqOptions: FreqSelectOption[] = [
  { value: 365, label: 'Daily'},
  { value: 52, label: 'Weekly'},
  { value: 12, label: 'Monthly'},
  { value: 1, label: 'Yearly'}
]

const calculatePrincipal = (initial: number, years: number, rate: number, freq: number) => {
  return initial * (Math.pow((1 + (rate/freq)), (years * freq)))
}

const calculateFuture = (years: number, rate: number, regularContribution: RegularContribution) => {
  return (regularContribution.amount * ((Math.pow(1 + (rate / regularContribution.frequency), (years * regularContribution.frequency)) - 1) / (rate/regularContribution.frequency)));
}

const calculateCompound = (initial: number, years: number, rate: number, freq: number, crypto: Coin, regularContribution: RegularContribution): CompoundData => {
  let data: CompoundData = {
    num: 0,
    coin: crypto
  };

  data.num = calculatePrincipal(initial, years, rate, freq) + calculateFuture(years, rate, regularContribution);

  return data;
}

const displayNum = (num: number | null | undefined, currencyFormat: boolean) => {
  const options = currencyFormat ? { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol'} : { maximumSignificantDigits: 3 };
  return num === null || num === undefined ? 0 : new Intl.NumberFormat('en-US', options).format(num);
}

const App = () => {

  const [compoundData, setCompoundData] = useState<CompoundData | null>(null)
  const [initialInvestment, setInitialInvestment] = useState<number>(0);
  const [years, setYears] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [frequency, setFrequency] = useState<FreqSelectOption | null>(freqOptions[0]);
  const [contFrequency, setContFrequency] = useState<FreqSelectOption | null>(freqOptions[0]);
  const [contribution, setContribution] = useState<number>(0);
  const [crypto, setCrypto] = useState<CryptoSelectOption | null>(null);
  const [cryptoOptions, setCryptoOptions] = useState<CryptoSelectOption[]>([])
  const [futurePrice, setFuturePrice] = useState<number>(0);


  const getCryptoList = (): Promise<CryptoSelectOption[]> => {
    return fetch('https://api.binance.com/api/v3/ticker/price', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        const tickers = data.reduce((res: CryptoSelectOption[], pair: TickerResponse) => {
          const symbol = pair.symbol;
          if(symbol.substring(symbol.length-4, symbol.length) === 'USDT') {
            const ticker = symbol.substring(0, symbol.length-4);
            res.push({value: {name: ticker, price: parseFloat(pair.price)}, label: ticker});
          }
          return res;
        }, [])
        console.log(tickers);
        return tickers;
      });
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setCompoundData(calculateCompound(initialInvestment, years, interestRate, frequency?.value || 1, crypto?.value || null, {amount: contribution, frequency: contFrequency?.value || 0}));  
  }

  const handleInputChange = (e: any) => {
    switch (e.target.name) {
      case "initialInvestment": setInitialInvestment(e.target.value); break;
      case "years": setYears(e.target.value); break;
      case "interestRate": setInterestRate(e.target.value); break;
      case "contribution": setContribution(e.target.value); break;
      case "futurePrice": setFuturePrice(e.target.value); break;
    }
  }

  useEffect(() => {
    getCryptoList().then(setCryptoOptions)
  }, [])

  useEffect(() => {
    if(cryptoOptions?.length) {
      setCrypto(cryptoOptions[0])
    }
  }, [cryptoOptions])

  return (
    <div className="pt-3 container">
      <Form onSubmit={handleSubmit}>

        <FormGroup>
          <Label for="crypto">Crypto</Label>
          <Select id="crypto" name="crypto" options={cryptoOptions} value={crypto} onChange={option => setCrypto(option)}/>
        </FormGroup>

        <FormGroup>
          <Label for="initialInvestment">Initial Investment</Label>
          <Input id="initialInvestment" name="initialInvestment" pattern="^\d*(\.\d{0,2})?$" onChange={handleInputChange}/>
        </FormGroup>

        <FormGroup>
          <Label for="years">Years</Label>
          <Input id="years" name="years" pattern="^\d*(\.\d{0,2})?$" onChange={handleInputChange}/>
        </FormGroup>

        <FormGroup>
          <Label for="interestRate">Interest Rate</Label>
          <Input id="interestRate" name="interestRate" pattern="^\d*(\.\d{0,2})?$" onChange={handleInputChange}/>
        </FormGroup>

        <FormGroup>
          <Label for="frequency">Compound Frequency</Label>
          <Select id="frequency" name="frequency" options={freqOptions} value={frequency} onChange={option => setFrequency(option)}/>
        </FormGroup>

        <FormGroup>
          <Label for="contGroup">Regular Contributions</Label>
          <InputGroup id="contGroup">
            <Input id="contribution" name="contribution" onChange={handleInputChange}/>
            <Select className="p-0 form-control" id="contFrequency" name="contFrequency" options={freqOptions} value={contFrequency} onChange={option => setContFrequency(option)}/>
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <Label for="futurePriceGroup">Estimated Future Price</Label>
          <InputGroup id="futurePriceGroup">
            <InputGroupAddon addonType="prepend">$</InputGroupAddon>
            <Input id="futurePrice" name="futurePrice" pattern="^\d*(\.\d{0,2})?$" onChange={handleInputChange}/>
          </InputGroup>
        </FormGroup>

        <Button className="form-control" type="submit">Calculate</Button>
      </Form>
      {compoundData && (
        <div className="mt-6">
          <p>Amount: {displayNum(compoundData.num, false)} {compoundData.coin?.name} @ {displayNum(compoundData.coin?.price, false)}</p>
          <p>USD: {displayNum(compoundData.num * (compoundData.coin?.price || 1), true)}</p>
          <p>Estimated Future Price: {displayNum(compoundData.num * (compoundData.coin?.price || 1) * futurePrice, true)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
