import React, {useState} from 'react';
import './App.css';
import { Input, Form, FormGroup, Label, Button, InputGroup } from 'reactstrap';
import Select from 'react-select';

type CompoundData = {
  cryptoCount: number,
  fiatCount: number
}

type CryptoSelectOption = {
  value: string,
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

const cryptoOptions: CryptoSelectOption[] = [
  { value: 'ADA', label: 'ADA' },
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' }
]

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

const calculateCompound = (initial: number, years: number, rate: number, freq: number, crypto: string, regularContribution: RegularContribution): CompoundData => {
  let data: CompoundData = {
    cryptoCount: 0,
    fiatCount: 0
  };

  console.log(regularContribution);
  console.log(calculatePrincipal(initial, years, rate, freq));
  console.log(calculateFuture(years, rate, regularContribution));

  data.cryptoCount = calculatePrincipal(initial, years, rate, freq) + calculateFuture(years, rate, regularContribution);

  return data;
}

const App = () => {

  const [compoundData, setCompoundData] = useState<CompoundData | null>(null)
  const [initialInvestment, setInitialInvestment] = useState<number>(0);
  const [years, setYears] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [frequency, setFrequency] = useState<FreqSelectOption | null>(freqOptions[0]);
  const [contFrequency, setContFrequency] = useState<FreqSelectOption | null>(freqOptions[0]);
  const [contribution, setContribution] = useState<number>(0);
  const [crypto, setCrypto] = useState<CryptoSelectOption | null>(cryptoOptions[0]);


  const handleSubmit = (e: any) => {
    e.preventDefault();
    setCompoundData(calculateCompound(initialInvestment, years, interestRate, frequency?.value || 1, crypto?.value || 'BTC', {amount: contribution, frequency: contFrequency?.value || 0}));
  }

  const handleInputChange = (e: any) => {
    switch (e.target.name) {
      case "initialInvestment": setInitialInvestment(e.target.value); break;
      case "years": setYears(e.target.value); break;
      case "interestRate": setInterestRate(e.target.value); break;
      case "contribution": setContribution(e.target.value); break;
      // case "frequency": setFrequency(e.target.value); break;
      // case "crypto": setCrypto(e.target.value); break;
    }
  }


  return (
    <div className="pt-3 container">
      <Form onSubmit={handleSubmit}>

        <FormGroup>
          <Label for="crypto">Crypto</Label>
          <Select id="crypto" name="crypto" options={cryptoOptions} value={crypto} onChange={option => setCrypto(option)}/>
        </FormGroup>

        <FormGroup>
          <Label for="initialInvestment">Initial Investment</Label>
          <Input id="initialInvestment" name="initialInvestment" onChange={handleInputChange}/>
        </FormGroup>

        <FormGroup>
          <Label for="years">Years</Label>
          <Input id="years" name="years" onChange={handleInputChange}/>
        </FormGroup>

        <FormGroup>
          <Label for="interestRate">Interest Rate</Label>
          <Input id="interestRate" name="interestRate" onChange={handleInputChange}/>
        </FormGroup>

        <FormGroup>
          <Label for="frequency">Compound Frequency</Label>
          <Select id="frequency" name="frequency" options={freqOptions} value={frequency} onChange={option => setFrequency(option)}/>
        </FormGroup>

        <FormGroup>
          <InputGroup>
            <Input id="contribution" name="contribution" onChange={handleInputChange}/>
            <Select id="contFrequency" name="contFrequency" options={freqOptions} value={contFrequency} onChange={option => setContFrequency(option)}/>
          </InputGroup>
        </FormGroup>

        <Button type="submit">Calculate</Button>
      </Form>
      {compoundData && (
        <div className="p-6">
          <p>Cypto: {compoundData.cryptoCount}</p>
          <p>Fiat: {compoundData.fiatCount}</p>
        </div>
      )}
    </div>
  );
}

export default App;
