<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;

class RabbitMQPublisher
{
    protected $connection;
    protected $channel;
    protected $exchange;
    protected $exchangeType;

    public function __construct()
    {
        $this->exchange = env('RABBITMQ_EXCHANGE', 'notifications.direct');
        $this->exchangeType = env('RABBITMQ_EXCHANGE_TYPE', 'direct');

        $this->connection = new AMQPStreamConnection(
            env('RABBITMQ_HOST', 'rabbitmq'),
            env('RABBITMQ_PORT', 5672),
            env('RABBITMQ_USER', 'guest'),
            env('RABBITMQ_PASSWORD', 'guest')
        );

        $this->channel = $this->connection->channel();
        $this->channel->exchange_declare($this->exchange, $this->exchangeType, false, true, false);

        $this->channel->queue_declare('email.queue', false, true, false, false);
        $this->channel->queue_declare('push.queue', false, true, false, false);

        $this->channel->queue_bind('email.queue', $this->exchange, 'notification.email');
        $this->channel->queue_bind('push.queue', $this->exchange, 'notification.push');
    }

    /**
     * @param string $routingKey
     * @param array $payload
     * @param array $headers
     */
    public function publish(string $routingKey, array $payload, array $headers = [])
    {
        $properties = [
        'content_type' => 'application/json',
        'delivery_mode' => 2,
    ];

    if (!empty($headers)) {
        $properties['application_headers'] = new AMQPTable($headers);
    }

    $msg = new AMQPMessage(json_encode($payload), $properties);

    $this->channel->confirm_select();
    $this->channel->basic_publish($msg, $this->exchange, $routingKey);
    $this->channel->wait_for_pending_acks();

            Log::info('Published message', [
            'exchange'    => $this->exchange,
            'routing_key' => $routingKey,
            'payload'     => $payload,
            'headers'     => $headers
        ]);
    }

    public function __destruct()
    {
        if ($this->channel) $this->channel->close();
        if ($this->connection) $this->connection->close();
    }
}
