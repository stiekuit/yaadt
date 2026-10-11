
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  suggestion?: string;
  details?: string;
}

interface ApiDiagnosticsProps {
  url: string;
  apiKey?: string;
  onDiagnosticComplete?: (results: DiagnosticResult[]) => void;
}

const ApiDiagnostics: React.FC<ApiDiagnosticsProps> = ({ 
  url, 
  apiKey, 
  onDiagnosticComplete 
}) => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: URL Format Validation
    try {
      const urlObj = new URL(url);
      diagnosticResults.push({
        test: 'URL Format',
        status: 'success',
        message: `Valid URL format detected`,
        details: `Protocol: ${urlObj.protocol}, Host: ${urlObj.hostname}`
      });
    } catch (e) {
      diagnosticResults.push({
        test: 'URL Format',
        status: 'error',
        message: 'Invalid URL format',
        suggestion: 'Ensure URL includes protocol (https://) and valid domain'
      });
    }

    // Test 2: HTTPS Check
    if (url.startsWith('https://')) {
      diagnosticResults.push({
        test: 'Security Protocol',
        status: 'success',
        message: 'Using secure HTTPS protocol'
      });
    } else if (url.startsWith('http://')) {
      diagnosticResults.push({
        test: 'Security Protocol',
        status: 'warning',
        message: 'Using HTTP (not secure)',
        suggestion: 'Consider using HTTPS for production environments'
      });
    }

    // Test 3: Basic Connectivity Test
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // This will help avoid CORS issues for basic connectivity
      });
      
      clearTimeout(timeoutId);
      
      diagnosticResults.push({
        test: 'Basic Connectivity',
        status: 'success',
        message: 'Server is reachable',
        details: 'Basic network connectivity confirmed'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          diagnosticResults.push({
            test: 'Basic Connectivity',
            status: 'error',
            message: 'Connection timeout (5s)',
            suggestion: 'Check if the server is running and accessible'
          });
        } else {
          diagnosticResults.push({
            test: 'Basic Connectivity',
            status: 'warning',
            message: 'Network connectivity issues detected',
            suggestion: 'This may be due to CORS policies or server configuration',
            details: error.message
          });
        }
      }
    }

    // Test 4: CORS Preflight Simulation
    try {
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      if (response.ok) {
        diagnosticResults.push({
          test: 'CORS Configuration',
          status: 'success',
          message: 'CORS preflight successful'
        });
      } else {
        diagnosticResults.push({
          test: 'CORS Configuration',
          status: 'warning',
          message: `CORS preflight failed (${response.status})`,
          suggestion: 'Server may need CORS headers configured for browser requests'
        });
      }
    } catch (error) {
      diagnosticResults.push({
        test: 'CORS Configuration',
        status: 'warning',
        message: 'Unable to test CORS configuration',
        suggestion: 'Ensure server allows cross-origin requests from this domain'
      });
    }

    // Test 5: Authentication Format Check (if API key provided)
    if (apiKey) {
      if (apiKey.length > 0) {
        diagnosticResults.push({
          test: 'API Key Format',
          status: 'success',
          message: `API key provided (${apiKey.length} characters)`,
          details: 'Key format appears valid'
        });
      } else {
        diagnosticResults.push({
          test: 'API Key Format',
          status: 'error',
          message: 'API key is empty',
          suggestion: 'Provide a valid API key for authentication'
        });
      }
    }

    // Test 6: Freshdesk-specific checks
    if (url.includes('.freshdesk.com')) {
      diagnosticResults.push({
        test: 'Freshdesk Domain',
        status: 'success',
        message: 'Freshdesk domain detected',
        details: 'URL appears to be a valid Freshdesk endpoint'
      });

      if (!url.includes('/api/v2/')) {
        diagnosticResults.push({
          test: 'API Version',
          status: 'warning',
          message: 'API version not detected in URL',
          suggestion: 'Freshdesk URLs typically include /api/v2/ for current API version'
        });
      }
    }

    setResults(diagnosticResults);
    onDiagnosticComplete?.(diagnosticResults);
    setRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span>API Connection Diagnostics</span>
          <Button
            onClick={runDiagnostics}
            disabled={running || !url}
            size="sm"
            variant="outline"
          >
            {running ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {results.length > 0 && (
        <CardContent className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium text-sm">{result.test}</span>
                </div>
                <Badge variant={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">{result.message}</p>
              
              {result.details && (
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {result.details}
                </p>
              )}
              
              {result.suggestion && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>Suggestion:</strong> {result.suggestion}
                  </p>
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Summary</h4>
            <div className="flex space-x-4 text-xs">
              <span className="text-green-600">
                ✓ {results.filter(r => r.status === 'success').length} Passed
              </span>
              <span className="text-yellow-600">
                ⚠ {results.filter(r => r.status === 'warning').length} Warnings  
              </span>
              <span className="text-red-600">
                ✗ {results.filter(r => r.status === 'error').length} Errors
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ApiDiagnostics;
