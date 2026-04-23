import { NS } from "@ns"
import { ServerName, servers } from "/lib/servers";

interface DeployConfig
{
	min_chance: number
}

function get_best_server (ns: NS)
{
	for ( const server of servers )
	{
		const hostname = server.hostname;
		const hack_chance = ns.hackAnalyzeChance( hostname );
	}
}

/** @param {NS} ns */
export async function main ( ns: NS, host: ServerName )
{
}