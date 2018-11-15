import * as common from "../common";

/**
 * Let this declare the way for well typed records for outputs
 *
 * General organization is:
 *
 *   - Declare the in-memory type
 *   - Declare the nbformat type (exactly matching nbformat.v4.schema.json)
 *   - Declare the message type (matching http://jupyter-client.readthedocs.io/en/stable/messaging.html)
 *   - Write a way to go from nbformat to our in-memory version
 *   - Write a way to go from message spec to our in-memory version
 *
 */

export type StreamName = "stdout" | "stderr";
export type StreamType = "stream";

export const STDOUT: StreamName = "stdout";
export const STDERR: StreamName = "stderr";

export const STREAM = "stream";

// In-memory version
export interface StreamOutput {
  outputType: StreamType;
  name: StreamName;
  text: string;
};

// On disk
export interface NbformatStreamOutput {
  output_type: StreamType;
  name: StreamName;
  text: common.MultilineString;
};

export interface StreamMessage {
  header: {
    msg_type: StreamType
  };
  content: {
    name: StreamName,
    text: string
  }
};

export function streamOutput(
  s: Readonly<{
    outputType?: 'stream';
    name?: StreamName,
    text?: string
  }>
): StreamOutput {
  return Object.freeze(
    Object.assign({}, { outputType: STREAM, name: STDOUT, text: "" }, s)
  );
}

streamOutput.type = STREAM;

streamOutput.fromNbformat = function fromNbformat(
  s: NbformatStreamOutput
): StreamOutput {
  return streamOutput({
    name: s.name,
    text: common.demultiline(s.text)
  });
};

streamOutput.fromJupyterMessage = function fromJupyterMessage(
  msg: StreamMessage
): StreamOutput {
  return streamOutput({
    name: msg.content.name,
    text: msg.content.text
  });
};
